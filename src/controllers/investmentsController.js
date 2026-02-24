const { query, getClient } = require('../config/db');

// ─── POST /api/investments ────────────────────────────────────────────────────
// Invest in a property — uses a DB transaction to keep data consistent
exports.invest = async (req, res, next) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { propertyId, amount } = req.body;
    const userId = req.user.id;

    if (!propertyId || !amount || amount <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'propertyId and a positive amount are required.' });
    }

    // 1. Lock & fetch property
    const propRes = await client.query(
      'SELECT * FROM properties WHERE id = $1 FOR UPDATE',
      [propertyId]
    );
    if (!propRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const prop = propRes.rows[0];

    if (prop.status !== 'active') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: `Property is ${prop.status} and not accepting investments.` });
    }

    if (amount < parseFloat(prop.min_investment)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Minimum investment for this property is $${prop.min_investment}.`,
      });
    }

    // 2. Calculate shares
    const sharePrice = parseFloat(prop.total_value) / prop.total_shares;
    const sharesToBuy = Math.floor(amount / sharePrice);
    if (sharesToBuy < 1) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Investment amount too low to purchase even 1 share.' });
    }

    const sharesRemaining = prop.total_shares - prop.shares_sold;
    if (sharesToBuy > sharesRemaining) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Only ${sharesRemaining} shares remaining. Reduce your investment amount.`,
      });
    }

    const actualCost = sharesToBuy * sharePrice;

    // 3. Check user wallet
    const userRes = await client.query(
      'SELECT wallet_balance FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );
    const wallet = parseFloat(userRes.rows[0].wallet_balance);
    if (wallet < actualCost) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. You have $${wallet.toFixed(2)}, need $${actualCost.toFixed(2)}.`,
      });
    }

    // 4. Deduct wallet
    await client.query(
      'UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2',
      [actualCost, userId]
    );

    // 5. Update property shares_sold
    await client.query(
      'UPDATE properties SET shares_sold = shares_sold + $1 WHERE id = $2',
      [sharesToBuy, propertyId]
    );

    // 6. Upsert investment record
    await client.query(`
      INSERT INTO investments (user_id, property_id, shares, amount)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, property_id) DO UPDATE
        SET shares = investments.shares + $3,
            amount = investments.amount + $4
    `, [userId, propertyId, sharesToBuy, actualCost]);

    // 7. Record transaction
    const txRes = await client.query(`
      INSERT INTO transactions (user_id, property_id, type, amount, shares, description, status)
      VALUES ($1, $2, 'investment', $3, $4, $5, 'completed')
      RETURNING *
    `, [userId, propertyId, actualCost, sharesToBuy, `Investment in ${prop.name}`]);

    // 8. Auto-close property if fully funded
    if (prop.shares_sold + sharesToBuy >= prop.total_shares) {
      await client.query("UPDATE properties SET status = 'funded' WHERE id = $1", [propertyId]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: `Successfully invested $${actualCost.toFixed(2)} in ${prop.name}!`,
      investment: {
        sharesBought: sharesToBuy,
        amountInvested: actualCost,
        sharePrice,
        transaction: txRes.rows[0],
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// ─── GET /api/investments/my ──────────────────────────────────────────────────
exports.getMyInvestments = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT i.*,
        p.name AS property_name, p.location, p.category, p.image_url,
        p.target_roi, p.annual_yield, p.dividend_freq, p.status AS property_status,
        p.total_value, p.total_shares,
        ROUND((p.total_value / p.total_shares) * i.shares, 2) AS current_value,
        ROUND(((p.total_value / p.total_shares) * i.shares - i.amount) / i.amount * 100, 2) AS gain_pct
      FROM investments i
      JOIN properties p ON p.id = i.property_id
      WHERE i.user_id = $1
      ORDER BY i.invested_at DESC
    `, [req.user.id]);

    const totalInvested = result.rows.reduce((s, r) => s + parseFloat(r.amount), 0);
    const totalValue    = result.rows.reduce((s, r) => s + parseFloat(r.current_value), 0);

    res.json({
      success: true,
      summary: {
        totalInvested,
        currentValue: totalValue,
        totalGain: totalValue - totalInvested,
        gainPct: totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested * 100).toFixed(2) : 0,
        propertiesCount: result.rows.length,
      },
      investments: result.rows.map(formatInvestment),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/investments/:id/sell ──────────────────────────────────────────
exports.sell = async (req, res, next) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { sharesToSell } = req.body;
    const userId = req.user.id;
    const investmentId = req.params.id;

    if (!sharesToSell || sharesToSell < 1) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'sharesToSell must be at least 1.' });
    }

    // Fetch investment
    const invRes = await client.query(
      'SELECT i.*, p.total_value, p.total_shares, p.name, p.id AS pid FROM investments i JOIN properties p ON p.id = i.property_id WHERE i.id = $1 AND i.user_id = $2 FOR UPDATE',
      [investmentId, userId]
    );
    if (!invRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Investment not found.' });
    }

    const inv = invRes.rows[0];
    if (sharesToSell > inv.shares) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: `You only have ${inv.shares} shares.` });
    }

    const sharePrice = parseFloat(inv.total_value) / inv.total_shares;
    const saleValue  = sharesToSell * sharePrice;

    // Credit wallet
    await client.query('UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2', [saleValue, userId]);

    // Update investment
    if (sharesToSell === inv.shares) {
      await client.query("UPDATE investments SET shares = 0, status = 'exited', amount = 0 WHERE id = $1", [investmentId]);
    } else {
      const proportionalCost = (sharesToSell / inv.shares) * parseFloat(inv.amount);
      await client.query(
        'UPDATE investments SET shares = shares - $1, amount = amount - $2 WHERE id = $3',
        [sharesToSell, proportionalCost, investmentId]
      );
    }

    // Reduce property shares_sold
    await client.query('UPDATE properties SET shares_sold = shares_sold - $1 WHERE id = $2', [sharesToSell, inv.pid]);

    // Record transaction
    await client.query(`
      INSERT INTO transactions (user_id, property_id, type, amount, shares, description, status)
      VALUES ($1, $2, 'sale', $3, $4, $5, 'completed')
    `, [userId, inv.pid, saleValue, sharesToSell, `Sold ${sharesToSell} shares of ${inv.name}`]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Sold ${sharesToSell} shares for $${saleValue.toFixed(2)}.`,
      saleValue,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// ─── Helper ──────────────────────────────────────────────────────────────────
const formatInvestment = (i) => ({
  id:              i.id,
  propertyId:      i.property_id,
  propertyName:    i.property_name,
  location:        i.location,
  category:        i.category,
  imageUrl:        i.image_url,
  targetRoi:       parseFloat(i.target_roi),
  annualYield:     parseFloat(i.annual_yield),
  dividendFreq:    i.dividend_freq,
  propertyStatus:  i.property_status,
  shares:          i.shares,
  amountInvested:  parseFloat(i.amount),
  currentValue:    parseFloat(i.current_value),
  gainPct:         parseFloat(i.gain_pct),
  status:          i.status,
  investedAt:      i.invested_at,
});
