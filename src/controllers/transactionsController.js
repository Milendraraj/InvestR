const { query } = require('../config/db');

// ─── GET /api/transactions ─────────────────────────────────────────────────
// Returns the current user's transaction history with filtering & pagination
exports.getMyTransactions = async (req, res, next) => {
  try {
    const { type, status, from, to, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = ['t.user_id = $1'];
    const params = [req.user.id];

    if (type) {
      params.push(type);
      conditions.push(`t.type = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`t.status = $${params.length}`);
    }
    if (from) {
      params.push(from);
      conditions.push(`t.created_at >= $${params.length}`);
    }
    if (to) {
      params.push(to);
      conditions.push(`t.created_at <= $${params.length}`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    params.push(parseInt(limit), offset);
    const dataRes = await query(`
      SELECT t.*, p.name AS property_name, p.category, p.image_url
      FROM transactions t
      LEFT JOIN properties p ON p.id = t.property_id
      ${where}
      ORDER BY t.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    const countRes = await query(
      `SELECT COUNT(*) FROM transactions t ${where}`,
      params.slice(0, -2)
    );

    // Summary stats
    const statsRes = await query(`
      SELECT
        SUM(CASE WHEN type = 'dividend'    THEN amount ELSE 0 END) AS total_dividends,
        SUM(CASE WHEN type = 'investment'  THEN amount ELSE 0 END) AS total_invested,
        SUM(CASE WHEN type = 'withdrawal'  THEN amount ELSE 0 END) AS total_withdrawn,
        SUM(CASE WHEN type = 'deposit'     THEN amount ELSE 0 END) AS total_deposited,
        COUNT(*) AS total_count
      FROM transactions
      WHERE user_id = $1 AND status = 'completed'
    `, [req.user.id]);

    const stats = statsRes.rows[0];

    res.json({
      success: true,
      total: parseInt(countRes.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      summary: {
        totalDividends:  parseFloat(stats.total_dividends  || 0),
        totalInvested:   parseFloat(stats.total_invested   || 0),
        totalWithdrawn:  parseFloat(stats.total_withdrawn  || 0),
        totalDeposited:  parseFloat(stats.total_deposited  || 0),
        transactionCount: parseInt(stats.total_count || 0),
      },
      transactions: dataRes.rows.map(formatTx),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/transactions/:id ────────────────────────────────────────────────
exports.getOne = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT t.*, p.name AS property_name, p.category, p.image_url
      FROM transactions t
      LEFT JOIN properties p ON p.id = t.property_id
      WHERE t.id = $1 AND t.user_id = $2
    `, [req.params.id, req.user.id]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    res.json({ success: true, transaction: formatTx(result.rows[0]) });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/transactions/deposit ──────────────────────────────────────────
exports.deposit = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number.' });
    }
    if (amount > 1000000) {
      return res.status(400).json({ success: false, message: 'Maximum single deposit is $1,000,000.' });
    }

    await query('UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2', [amount, req.user.id]);

    const txRes = await query(`
      INSERT INTO transactions (user_id, type, amount, description, status)
      VALUES ($1, 'deposit', $2, 'Wallet top-up', 'completed') RETURNING *
    `, [req.user.id, amount]);

    const walletRes = await query('SELECT wallet_balance FROM users WHERE id = $1', [req.user.id]);

    res.status(201).json({
      success: true,
      message: `$${parseFloat(amount).toFixed(2)} deposited to your wallet.`,
      newBalance: parseFloat(walletRes.rows[0].wallet_balance),
      transaction: formatTx(txRes.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/transactions/withdraw ─────────────────────────────────────────
exports.withdraw = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number.' });
    }

    const walletRes = await query('SELECT wallet_balance FROM users WHERE id = $1', [req.user.id]);
    const balance = parseFloat(walletRes.rows[0].wallet_balance);

    if (amount > balance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: $${balance.toFixed(2)}.`,
      });
    }

    await query('UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2', [amount, req.user.id]);

    const txRes = await query(`
      INSERT INTO transactions (user_id, type, amount, description, status)
      VALUES ($1, 'withdrawal', $2, 'Wallet withdrawal', 'completed') RETURNING *
    `, [req.user.id, amount]);

    res.status(201).json({
      success: true,
      message: `$${parseFloat(amount).toFixed(2)} withdrawal initiated.`,
      newBalance: balance - amount,
      transaction: formatTx(txRes.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/transactions/dividends ─────────────────────────────────────────
exports.getMyDividends = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await query(`
      SELECT d.*, p.name AS property_name, p.image_url
      FROM dividends d
      JOIN properties p ON p.id = d.property_id
      WHERE d.user_id = $1
      ORDER BY d.paid_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, parseInt(limit), offset]);

    const totalRes = await query(
      'SELECT SUM(amount) AS total FROM dividends WHERE user_id = $1 AND status = $2',
      [req.user.id, 'paid']
    );

    res.json({
      success: true,
      totalEarned: parseFloat(totalRes.rows[0].total || 0),
      dividends: result.rows.map(d => ({
        id:           d.id,
        propertyId:   d.property_id,
        propertyName: d.property_name,
        imageUrl:     d.image_url,
        amount:       parseFloat(d.amount),
        periodLabel:  d.period_label,
        status:       d.status,
        paidAt:       d.paid_at,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Helper ──────────────────────────────────────────────────────────────────
const formatTx = (t) => ({
  id:           t.id,
  type:         t.type,
  amount:       parseFloat(t.amount),
  shares:       t.shares,
  description:  t.description,
  status:       t.status,
  referenceId:  t.reference_id,
  propertyId:   t.property_id || null,
  propertyName: t.property_name || null,
  category:     t.category || null,
  imageUrl:     t.image_url || null,
  createdAt:    t.created_at,
});
