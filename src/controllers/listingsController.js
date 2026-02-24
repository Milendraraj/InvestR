const { query } = require('../config/db');

// ─── POST /api/listings ───────────────────────────────────────────────────────
exports.submitListing = async (req, res, next) => {
  try {
    const {
      propName, propType, city, country, askPrice, targetRoi, termYears,
      occupancyPct, grossRent, opEx, noi, minInvestment, distribFreq, description,
    } = req.body;

    if (!propName || !propType || !askPrice) {
      return res.status(400).json({ success: false, message: 'Property name, type, and asking price are required.' });
    }

    const refId = 'INV-' + new Date().getFullYear() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    const result = await query(`
      INSERT INTO property_listings
        (submitted_by, prop_name, prop_type, city, country, ask_price, target_roi,
         term_years, occupancy_pct, gross_rent, op_ex, noi, min_investment,
         distrib_freq, description, reference_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *
    `, [
      req.user?.id || null, propName, propType, city, country, askPrice, targetRoi,
      termYears, occupancyPct, grossRent, opEx, noi, minInvestment,
      distribFreq, description, refId,
    ]);

    res.status(201).json({
      success: true,
      message: 'Listing submitted successfully! Our team will review it within 3-5 business days.',
      referenceId: refId,
      listing: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/listings (admin only) ──────────────────────────────────────────
exports.getAllListings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let where = '';

    if (status) {
      params.push(status);
      where = `WHERE pl.status = $${params.length}`;
    }

    params.push(parseInt(limit), offset);
    const result = await query(`
      SELECT pl.*, u.full_name AS submitted_by_name, u.email AS submitted_by_email
      FROM property_listings pl
      LEFT JOIN users u ON u.id = pl.submitted_by
      ${where}
      ORDER BY pl.submitted_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    res.json({ success: true, listings: result.rows });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/listings/:id/status (admin only) ─────────────────────────────
exports.updateListingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const result = await query(
      'UPDATE property_listings SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    res.json({ success: true, listing: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/listings/my ─────────────────────────────────────────────────────
exports.getMyListings = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM property_listings WHERE submitted_by = $1 ORDER BY submitted_at DESC',
      [req.user.id]
    );
    res.json({ success: true, listings: result.rows });
  } catch (err) {
    next(err);
  }
};
