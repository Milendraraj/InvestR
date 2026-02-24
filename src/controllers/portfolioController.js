const { query } = require('../config/db');

// ─── GET /api/portfolio ───────────────────────────────────────────────────────
// Full portfolio dashboard data for authenticated user
exports.getPortfolio = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Portfolio holdings
    const holdingsRes = await query(`
      SELECT i.*,
        p.name, p.location, p.category, p.image_url, p.status AS property_status,
        p.target_roi, p.annual_yield, p.dividend_freq, p.term_years,
        p.total_value, p.total_shares,
        ROUND((p.total_value::numeric / p.total_shares) * i.shares, 2) AS current_value,
        ROUND(((p.total_value::numeric / p.total_shares) * i.shares - i.amount) / NULLIF(i.amount, 0) * 100, 2) AS gain_pct,
        COALESCE((
          SELECT SUM(d.amount) FROM dividends d
          WHERE d.user_id = $1 AND d.property_id = i.property_id AND d.status = 'paid'
        ), 0) AS dividends_earned
      FROM investments i
      JOIN properties p ON p.id = i.property_id
      WHERE i.user_id = $1 AND i.shares > 0
      ORDER BY i.amount DESC
    `, [userId]);

    // KPI summary
    const totalInvested   = holdingsRes.rows.reduce((s, r) => s + parseFloat(r.amount), 0);
    const currentValue    = holdingsRes.rows.reduce((s, r) => s + parseFloat(r.current_value), 0);
    const totalDividends  = holdingsRes.rows.reduce((s, r) => s + parseFloat(r.dividends_earned), 0);
    const avgRoi          = holdingsRes.rows.length
      ? holdingsRes.rows.reduce((s, r) => s + parseFloat(r.target_roi), 0) / holdingsRes.rows.length
      : 0;

    // Monthly income estimate
    const monthlyIncome = holdingsRes.rows.reduce((s, r) => {
      const monthlyYield = (parseFloat(r.annual_yield) / 100 / 12) * parseFloat(r.current_value);
      return s + monthlyYield;
    }, 0);

    // Category allocation
    const allocation = {};
    holdingsRes.rows.forEach(r => {
      allocation[r.category] = (allocation[r.category] || 0) + parseFloat(r.current_value);
    });

    // Wallet balance
    const walletRes = await query('SELECT wallet_balance FROM users WHERE id = $1', [userId]);

    // Recent dividends (last 5)
    const divsRes = await query(`
      SELECT d.*, p.name AS property_name FROM dividends d
      JOIN properties p ON p.id = d.property_id
      WHERE d.user_id = $1 ORDER BY d.paid_at DESC LIMIT 5
    `, [userId]);

    // Recent transactions (last 5)
    const txRes = await query(`
      SELECT t.*, p.name AS property_name FROM transactions t
      LEFT JOIN properties p ON p.id = t.property_id
      WHERE t.user_id = $1 ORDER BY t.created_at DESC LIMIT 5
    `, [userId]);

    res.json({
      success: true,
      portfolio: {
        summary: {
          totalInvested,
          currentValue,
          totalGain:        currentValue - totalInvested,
          gainPct:          totalInvested > 0 ? +((currentValue - totalInvested) / totalInvested * 100).toFixed(2) : 0,
          totalDividends,
          monthlyIncome:    +monthlyIncome.toFixed(2),
          avgRoi:           +avgRoi.toFixed(2),
          propertiesOwned:  holdingsRes.rows.length,
          walletBalance:    parseFloat(walletRes.rows[0]?.wallet_balance || 0),
        },
        allocation: Object.entries(allocation).map(([cat, val]) => ({
          category: cat,
          value: +val.toFixed(2),
          pct: +((val / currentValue) * 100).toFixed(1),
        })),
        holdings: holdingsRes.rows.map(r => ({
          investmentId:   r.id,
          propertyId:     r.property_id,
          name:           r.name,
          location:       r.location,
          category:       r.category,
          imageUrl:       r.image_url,
          propertyStatus: r.property_status,
          targetRoi:      parseFloat(r.target_roi),
          annualYield:    parseFloat(r.annual_yield),
          dividendFreq:   r.dividend_freq,
          termYears:      r.term_years,
          shares:         r.shares,
          amountInvested: parseFloat(r.amount),
          currentValue:   parseFloat(r.current_value),
          gainPct:        parseFloat(r.gain_pct || 0),
          dividendsEarned: parseFloat(r.dividends_earned),
          investedAt:     r.invested_at,
        })),
        recentDividends: divsRes.rows.map(d => ({
          id:           d.id,
          propertyName: d.property_name,
          amount:       parseFloat(d.amount),
          periodLabel:  d.period_label,
          status:       d.status,
          paidAt:       d.paid_at,
        })),
        recentTransactions: txRes.rows.map(t => ({
          id:           t.id,
          type:         t.type,
          amount:       parseFloat(t.amount),
          description:  t.description,
          propertyName: t.property_name,
          status:       t.status,
          createdAt:    t.created_at,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/portfolio/performance ──────────────────────────────────────────
// Returns per-property performance ranking
exports.getPerformance = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT i.*,
        p.name, p.target_roi, p.annual_yield, p.location, p.category,
        ROUND((p.total_value::numeric / p.total_shares) * i.shares, 2) AS current_value,
        ROUND(((p.total_value::numeric / p.total_shares) * i.shares - i.amount) / NULLIF(i.amount, 0) * 100, 2) AS gain_pct
      FROM investments i
      JOIN properties p ON p.id = i.property_id
      WHERE i.user_id = $1 AND i.shares > 0
      ORDER BY p.target_roi DESC
    `, [req.user.id]);

    res.json({
      success: true,
      performance: result.rows.map(r => ({
        propertyId:     r.property_id,
        name:           r.name,
        location:       r.location,
        category:       r.category,
        targetRoi:      parseFloat(r.target_roi),
        annualYield:    parseFloat(r.annual_yield),
        amountInvested: parseFloat(r.amount),
        currentValue:   parseFloat(r.current_value),
        gainPct:        parseFloat(r.gain_pct || 0),
      })),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/portfolio/wishlist ──────────────────────────────────────────────
exports.getWishlist = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT p.*, w.added_at,
        ROUND((p.shares_sold::numeric / p.total_shares) * 100, 1) AS funded_pct
      FROM wishlist w
      JOIN properties p ON p.id = w.property_id
      WHERE w.user_id = $1
      ORDER BY w.added_at DESC
    `, [req.user.id]);

    res.json({ success: true, wishlist: result.rows });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/portfolio/wishlist/:propertyId ─────────────────────────────────
exports.addToWishlist = async (req, res, next) => {
  try {
    await query(
      'INSERT INTO wishlist (user_id, property_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, req.params.propertyId]
    );
    res.status(201).json({ success: true, message: 'Property saved to wishlist.' });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/portfolio/wishlist/:propertyId ───────────────────────────────
exports.removeFromWishlist = async (req, res, next) => {
  try {
    await query(
      'DELETE FROM wishlist WHERE user_id = $1 AND property_id = $2',
      [req.user.id, req.params.propertyId]
    );
    res.json({ success: true, message: 'Removed from wishlist.' });
  } catch (err) {
    next(err);
  }
};
