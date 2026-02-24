const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

/**
 * Verifies JWT from Authorization header.
 * Attaches req.user = { id, email, role } on success.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access token required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Confirm user still exists
    const result = await query(
      'SELECT id, email, role, kyc_status FROM users WHERE id = $1',
      [decoded.id]
    );
    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

/**
 * Restricts route to admin users only.
 * Must be used AFTER authenticate middleware.
 */
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};

/**
 * Restricts route to KYC-verified users only.
 */
const kycRequired = (req, res, next) => {
  if (req.user?.kyc_status !== 'verified') {
    return res.status(403).json({
      success: false,
      message: 'KYC verification required to invest.',
    });
  }
  next();
};

module.exports = { authenticate, adminOnly, kycRequired };
