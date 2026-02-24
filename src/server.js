/**
 * InvestR Backend — Entry Point
 * Express + PostgreSQL REST API
 */

require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const rateLimit = require('express-rate-limit');

const { errorHandler, notFound } = require('./middleware/errorHandler');

// ─── Routes ──────────────────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth');
const propertiesRoutes   = require('./routes/properties');
const investmentsRoutes  = require('./routes/investments');
const transactionsRoutes = require('./routes/transactions');
const portfolioRoutes    = require('./routes/portfolio');
const listingsRoutes     = require('./routes/listings');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Global rate limiter — 200 requests per 15 minutes per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' },
});

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'InvestR API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',          authLimiter, authRoutes);
app.use('/api/properties',    propertiesRoutes);
app.use('/api/investments',   investmentsRoutes);
app.use('/api/transactions',  transactionsRoutes);
app.use('/api/portfolio',     portfolioRoutes);
app.use('/api/listings',      listingsRoutes);

// ─── API Overview ─────────────────────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'InvestR API — Fractional Real Estate Platform',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register':          'Create account',
        'POST /api/auth/login':             'Login',
        'GET  /api/auth/me':                'Get current user (auth)',
        'PATCH /api/auth/me':               'Update profile (auth)',
        'POST /api/auth/change-password':   'Change password (auth)',
      },
      properties: {
        'GET  /api/properties':             'List all properties (public)',
        'GET  /api/properties/:id':         'Get property detail (public)',
        'POST /api/properties':             'Create property (admin)',
        'PATCH /api/properties/:id':        'Update property (admin)',
        'DELETE /api/properties/:id':       'Delete property (admin)',
      },
      investments: {
        'POST /api/investments':            'Invest in a property (auth + KYC)',
        'GET  /api/investments/my':         'My investments (auth)',
        'POST /api/investments/:id/sell':   'Sell shares (auth + KYC)',
      },
      portfolio: {
        'GET  /api/portfolio':              'Full portfolio dashboard (auth)',
        'GET  /api/portfolio/performance':  'Performance per property (auth)',
        'GET  /api/portfolio/wishlist':     'Wishlist (auth)',
        'POST /api/portfolio/wishlist/:id': 'Add to wishlist (auth)',
        'DELETE /api/portfolio/wishlist/:id': 'Remove from wishlist (auth)',
      },
      transactions: {
        'GET  /api/transactions':           'Transaction history (auth)',
        'GET  /api/transactions/dividends': 'Dividend history (auth)',
        'GET  /api/transactions/:id':       'Transaction detail (auth)',
        'POST /api/transactions/deposit':   'Deposit to wallet (auth)',
        'POST /api/transactions/withdraw':  'Withdraw from wallet (auth)',
      },
      listings: {
        'POST /api/listings':               'Submit property listing (auth)',
        'GET  /api/listings/my':            'My submitted listings (auth)',
        'GET  /api/listings':               'All listings (admin)',
        'PATCH /api/listings/:id/status':   'Approve/reject listing (admin)',
      },
    },
  });
});

// ─── 404 & Error Handler ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log(`  ║   InvestR API running on :${PORT}      ║`);
  console.log(`  ║   http://localhost:${PORT}/api         ║`);
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
