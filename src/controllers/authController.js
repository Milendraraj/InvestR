const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { query } = require('../config/db');

/** Generate a signed JWT for a user */
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

/** Sanitised user object (no password) */
const safeUser = (u) => ({
  id:             u.id,
  fullName:       u.full_name,
  email:          u.email,
  phone:          u.phone,
  country:        u.country,
  role:           u.role,
  kycStatus:      u.kyc_status,
  walletBalance:  parseFloat(u.wallet_balance),
  avatarUrl:      u.avatar_url,
  createdAt:      u.created_at,
});

// ─── POST /api/auth/register ─────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { fullName, email, password, phone, country } = req.body;

    // Check duplicate
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const hash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, phone, country)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [fullName, email.toLowerCase(), hash, phone || null, country || null]
    );

    const user = result.rows[0];
    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to InvestR!',
      token,
      user: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login ────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user);

    res.json({
      success: true,
      message: `Welcome back, ${user.full_name}!`,
      token,
      user: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user: safeUser(result.rows[0]) });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/auth/me ──────────────────────────────────────────────────────
exports.updateMe = async (req, res, next) => {
  try {
    const { fullName, phone, country, avatarUrl } = req.body;

    const result = await query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           phone     = COALESCE($2, phone),
           country   = COALESCE($3, country),
           avatar_url= COALESCE($4, avatar_url)
       WHERE id = $5 RETURNING *`,
      [fullName || null, phone || null, country || null, avatarUrl || null, req.user.id]
    );

    res.json({ success: true, user: safeUser(result.rows[0]) });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/change-password ─────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Provide current and new password (min 8 chars).' });
    }

    const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
};
