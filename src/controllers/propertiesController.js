const { query } = require('../config/db');
const { validationResult } = require('express-validator');

// ─── GET /api/properties ─────────────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { category, status, minRoi, maxMin, search, sort, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      conditions.push(`p.category = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`p.status = $${params.length}`);
    }
    if (minRoi) {
      params.push(parseFloat(minRoi));
      conditions.push(`p.target_roi >= $${params.length}`);
    }
    if (maxMin) {
      params.push(parseFloat(maxMin));
      conditions.push(`p.min_investment <= $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(p.name ILIKE $${params.length} OR p.location ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const orderMap = {
      roi_desc:    'p.target_roi DESC',
      roi_asc:     'p.target_roi ASC',
      value_desc:  'p.total_value DESC',
      value_asc:   'p.total_value ASC',
      newest:      'p.created_at DESC',
      funded_desc: 'funded_pct DESC',
    };
    const orderBy = orderMap[sort] || 'p.created_at DESC';

    params.push(parseInt(limit), offset);
    const dataQuery = `
      SELECT p.*,
        ROUND((p.shares_sold::numeric / p.total_shares) * 100, 1) AS funded_pct,
        (SELECT COUNT(*) FROM investments i WHERE i.property_id = p.id) AS investor_count
      FROM properties p
      ${where}
      ORDER BY ${orderBy}
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const countQuery = `SELECT COUNT(*) FROM properties p ${where}`;

    const [dataRes, countRes] = await Promise.all([
      query(dataQuery, params),
      query(countQuery, params.slice(0, -2)),
    ]);

    res.json({
      success: true,
      total: parseInt(countRes.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      properties: dataRes.rows.map(formatProperty),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/properties/:id ─────────────────────────────────────────────────
exports.getOne = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT p.*,
        ROUND((p.shares_sold::numeric / p.total_shares) * 100, 1) AS funded_pct,
        (SELECT COUNT(*) FROM investments i WHERE i.property_id = p.id) AS investor_count,
        u.full_name AS listed_by_name
      FROM properties p
      LEFT JOIN users u ON u.id = p.listed_by
      WHERE p.id = $1
    `, [req.params.id]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }
    res.json({ success: true, property: formatProperty(result.rows[0]) });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/properties (admin) ────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const {
      name, location, city, country, category, description, imageUrl,
      totalValue, totalShares, minInvestment, targetRoi, annualYield,
      appreciation, dividendFreq, termYears,
    } = req.body;

    const result = await query(`
      INSERT INTO properties
        (name, location, city, country, category, description, image_url,
         total_value, total_shares, min_investment, target_roi, annual_yield,
         appreciation, dividend_freq, term_years, listed_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *
    `, [
      name, location, city, country, category, description, imageUrl,
      totalValue, totalShares || 1000, minInvestment, targetRoi, annualYield,
      appreciation, dividendFreq || 'Monthly', termYears, req.user.id,
    ]);

    res.status(201).json({ success: true, property: formatProperty(result.rows[0]) });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/properties/:id (admin) ───────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const allowed = ['name','location','city','country','description','image_url','status',
                     'target_roi','annual_yield','appreciation','dividend_freq','term_years','min_investment'];
    const sets = [], params = [];

    for (const [key, val] of Object.entries(req.body)) {
      const col = camelToSnake(key);
      if (allowed.includes(col)) {
        params.push(val);
        sets.push(`${col} = $${params.length}`);
      }
    }
    if (!sets.length) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }

    params.push(req.params.id);
    const result = await query(
      `UPDATE properties SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }
    res.json({ success: true, property: formatProperty(result.rows[0]) });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/properties/:id (admin) ──────────────────────────────────────
exports.remove = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM properties WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }
    res.json({ success: true, message: 'Property deleted.' });
  } catch (err) {
    next(err);
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatProperty = (p) => ({
  id:            p.id,
  name:          p.name,
  location:      p.location,
  city:          p.city,
  country:       p.country,
  category:      p.category,
  description:   p.description,
  imageUrl:      p.image_url,
  totalValue:    parseFloat(p.total_value),
  totalShares:   p.total_shares,
  sharePrice:    parseFloat(p.share_price),
  sharesSold:    p.shares_sold,
  fundedPct:     parseFloat(p.funded_pct || 0),
  minInvestment: parseFloat(p.min_investment),
  targetRoi:     parseFloat(p.target_roi),
  annualYield:   parseFloat(p.annual_yield),
  appreciation:  parseFloat(p.appreciation),
  dividendFreq:  p.dividend_freq,
  termYears:     p.term_years,
  status:        p.status,
  investorCount: parseInt(p.investor_count || 0),
  listedByName:  p.listed_by_name || null,
  createdAt:     p.created_at,
});

const camelToSnake = (str) => str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
