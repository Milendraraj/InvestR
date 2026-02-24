/**
 * scripts/migrate.js
 * Creates all tables for the InvestR platform.
 * Run with: npm run migrate
 */

require('dotenv').config();
const { pool } = require('../src/config/db');

const schema = `

-- ─── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone         VARCHAR(30),
  country       VARCHAR(80),
  kyc_status    VARCHAR(20) DEFAULT 'pending'   CHECK (kyc_status IN ('pending','verified','rejected')),
  role          VARCHAR(20) DEFAULT 'investor'  CHECK (role IN ('investor','admin')),
  avatar_url    TEXT,
  wallet_balance NUMERIC(14,2) DEFAULT 0.00,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PROPERTIES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS properties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(200) NOT NULL,
  location        VARCHAR(200) NOT NULL,
  city            VARCHAR(100),
  country         VARCHAR(100),
  category        VARCHAR(50)  NOT NULL CHECK (category IN ('commercial','residential','industrial')),
  description     TEXT,
  image_url       TEXT,
  total_value     NUMERIC(16,2) NOT NULL,
  total_shares    INTEGER NOT NULL DEFAULT 1000,
  share_price     NUMERIC(12,2) GENERATED ALWAYS AS (total_value / total_shares) STORED,
  shares_sold     INTEGER NOT NULL DEFAULT 0,
  min_investment  NUMERIC(12,2) NOT NULL DEFAULT 500,
  target_roi      NUMERIC(6,2),   -- e.g. 12.50 means 12.50%
  annual_yield    NUMERIC(6,2),
  appreciation    NUMERIC(6,2),
  dividend_freq   VARCHAR(20) DEFAULT 'Monthly' CHECK (dividend_freq IN ('Monthly','Quarterly','Annually')),
  term_years      INTEGER,
  status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','funded','closed','coming_soon')),
  listed_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INVESTMENTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id   UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  shares        INTEGER NOT NULL CHECK (shares > 0),
  amount        NUMERIC(14,2) NOT NULL,
  status        VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','exited','pending')),
  invested_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)   -- one investment record per user per property (shares accumulate)
);

-- ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id     UUID REFERENCES properties(id) ON DELETE SET NULL,
  type            VARCHAR(30) NOT NULL CHECK (type IN ('investment','dividend','withdrawal','deposit','sale')),
  amount          NUMERIC(14,2) NOT NULL,
  shares          INTEGER,
  description     TEXT,
  status          VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending','completed','failed','reversed')),
  reference_id    VARCHAR(60) UNIQUE DEFAULT ('TXN-' || upper(substr(md5(random()::text), 1, 10))),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DIVIDENDS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dividends (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount        NUMERIC(12,2) NOT NULL,
  period_label  VARCHAR(40),   -- e.g. "Jan 2025"
  status        VARCHAR(20) DEFAULT 'paid' CHECK (status IN ('paid','pending','cancelled')),
  paid_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WISHLIST ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, property_id)
);

-- ─── PROPERTY LISTINGS (user-submitted) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS property_listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  prop_name       VARCHAR(200),
  prop_type       VARCHAR(50),
  city            VARCHAR(100),
  country         VARCHAR(100),
  ask_price       NUMERIC(16,2),
  target_roi      NUMERIC(6,2),
  term_years      INTEGER,
  occupancy_pct   NUMERIC(5,2),
  gross_rent      NUMERIC(12,2),
  op_ex           NUMERIC(12,2),
  noi             NUMERIC(12,2),
  min_investment  NUMERIC(12,2),
  distrib_freq    VARCHAR(20),
  description     TEXT,
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reference_id    VARCHAR(30),
  submitted_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_investments_user       ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_property   ON investments(property_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user      ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type      ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_properties_category    ON properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_status      ON properties(status);
CREATE INDEX IF NOT EXISTS idx_dividends_user         ON dividends(user_id);

-- ─── AUTO-UPDATE updated_at ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at       ON users;
DROP TRIGGER IF EXISTS trg_properties_updated_at  ON properties;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🚀 Running migrations...');
    await client.query(schema);
    console.log('✅ All tables created successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
