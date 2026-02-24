/**
 * scripts/seed.js
 * Seeds the database with sample properties and an admin user.
 * Run with: npm run seed
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

const properties = [
  {
    name: 'Azure Heights Commercial',
    location: 'Austin, TX',
    city: 'Austin', country: 'USA',
    category: 'commercial',
    description: 'A premier Class A office complex in Austin\'s booming tech corridor. Fully leased with blue-chip tenants including two Fortune 500 companies.',
    image_url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
    total_value: 4200000, total_shares: 8400, shares_sold: 7140,
    min_investment: 500, target_roi: 12.5, annual_yield: 8.2, appreciation: 4.3,
    dividend_freq: 'Monthly', term_years: 5, status: 'active',
  },
  {
    name: 'Emerald Green Villas',
    location: 'London, UK',
    city: 'London', country: 'UK',
    category: 'residential',
    description: 'Luxury residential development in South Kensington. 24 high-end units with rooftop gardens.',
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80',
    total_value: 8700000, total_shares: 7250, shares_sold: 3262,
    min_investment: 1200, target_roi: 9.2, annual_yield: 5.8, appreciation: 3.4,
    dividend_freq: 'Quarterly', term_years: 7, status: 'active',
  },
  {
    name: 'Nova Logistics Hub',
    location: 'Dubai, UAE',
    city: 'Dubai', country: 'UAE',
    category: 'industrial',
    description: 'State-of-the-art logistics and warehousing facility in the Dubai industrial zone. Long-term lease with DHL and Amazon Logistics.',
    image_url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80',
    total_value: 12100000, total_shares: 4840, shares_sold: 4453,
    min_investment: 2500, target_roi: 14.8, annual_yield: 10.1, appreciation: 4.7,
    dividend_freq: 'Monthly', term_years: 10, status: 'active',
  },
  {
    name: 'Pacific View Residences',
    location: 'Singapore',
    city: 'Singapore', country: 'Singapore',
    category: 'residential',
    description: 'Premium condominiums on Singapore\'s iconic waterfront with stunning city-bay views.',
    image_url: 'https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=600&q=80',
    total_value: 6300000, total_shares: 7875, shares_sold: 4882,
    min_investment: 800, target_roi: 10.4, annual_yield: 7.1, appreciation: 3.3,
    dividend_freq: 'Monthly', term_years: 5, status: 'active',
  },
  {
    name: 'Riviera Business Park',
    location: 'Paris, France',
    city: 'Paris', country: 'France',
    category: 'commercial',
    description: 'Mixed-use business park 20 minutes from Paris CBD. 98% occupancy with anchor tenants BNP Paribas and L\'Oréal.',
    image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&q=80',
    total_value: 9500000, total_shares: 6333, shares_sold: 4623,
    min_investment: 1500, target_roi: 11.2, annual_yield: 7.8, appreciation: 3.4,
    dividend_freq: 'Quarterly', term_years: 8, status: 'active',
  },
  {
    name: 'GreenTech Industrial Yard',
    location: 'Frankfurt, Germany',
    city: 'Frankfurt', country: 'Germany',
    category: 'industrial',
    description: 'Next-gen sustainable industrial campus with solar-powered operations near Frankfurt airport.',
    image_url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=600&q=80',
    total_value: 15200000, total_shares: 5066, shares_sold: 1874,
    min_investment: 3000, target_roi: 13.7, annual_yield: 9.4, appreciation: 4.3,
    dividend_freq: 'Monthly', term_years: 12, status: 'active',
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding database...');

    // Admin user
    const hash = await bcrypt.hash('Admin@123', 12);
    await client.query(`
      INSERT INTO users (full_name, email, password_hash, role, kyc_status, wallet_balance)
      VALUES ($1, $2, $3, 'admin', 'verified', 50000.00)
      ON CONFLICT (email) DO NOTHING
    `, ['Admin User', 'admin@investr.com', hash]);

    // Demo investor
    const demoHash = await bcrypt.hash('Demo@123', 12);
    const demoRes = await client.query(`
      INSERT INTO users (full_name, email, password_hash, role, kyc_status, wallet_balance)
      VALUES ($1, $2, $3, 'investor', 'verified', 25000.00)
      ON CONFLICT (email) DO UPDATE SET wallet_balance = 25000.00
      RETURNING id
    `, ['Demo Investor', 'demo@investr.com', demoHash]);
    const demoUserId = demoRes.rows[0].id;

    // Properties
    const propIds = [];
    for (const p of properties) {
      const res = await client.query(`
        INSERT INTO properties
          (name, location, city, country, category, description, image_url,
           total_value, total_shares, shares_sold, min_investment,
           target_roi, annual_yield, appreciation, dividend_freq, term_years, status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [
        p.name, p.location, p.city, p.country, p.category, p.description, p.image_url,
        p.total_value, p.total_shares, p.shares_sold, p.min_investment,
        p.target_roi, p.annual_yield, p.appreciation, p.dividend_freq, p.term_years, p.status,
      ]);
      if (res.rows[0]) propIds.push(res.rows[0].id);
    }

    // Sample investments for demo user
    if (propIds.length >= 4) {
      const investments = [
        { pid: propIds[0], shares: 10, amount: 5000 },
        { pid: propIds[1], shares: 4,  amount: 4800 },
        { pid: propIds[2], shares: 3,  amount: 7500 },
        { pid: propIds[3], shares: 2,  amount: 1600 },
      ];
      for (const inv of investments) {
        await client.query(`
          INSERT INTO investments (user_id, property_id, shares, amount, status)
          VALUES ($1, $2, $3, $4, 'active')
          ON CONFLICT (user_id, property_id) DO NOTHING
        `, [demoUserId, inv.pid, inv.shares, inv.amount]);
      }

      // Sample transactions
      const txns = [
        { pid: propIds[0], type: 'investment', amount: 5000,  shares: 10, desc: 'Investment in Azure Heights Commercial' },
        { pid: propIds[1], type: 'investment', amount: 4800,  shares: 4,  desc: 'Investment in Emerald Green Villas' },
        { pid: propIds[0], type: 'dividend',   amount: 124,   shares: null, desc: 'Monthly dividend – Azure Heights' },
        { pid: propIds[2], type: 'investment', amount: 7500,  shares: 3,  desc: 'Investment in Nova Logistics Hub' },
        { pid: propIds[1], type: 'dividend',   amount: 89.5,  shares: null, desc: 'Quarterly dividend – Emerald Villas' },
        { pid: propIds[3], type: 'investment', amount: 1600,  shares: 2,  desc: 'Investment in Pacific View Residences' },
      ];
      for (const tx of txns) {
        await client.query(`
          INSERT INTO transactions (user_id, property_id, type, amount, shares, description, status)
          VALUES ($1, $2, $3, $4, $5, $6, 'completed')
        `, [demoUserId, tx.pid, tx.type, tx.amount, tx.shares, tx.desc]);
      }

      // Sample dividends
      await client.query(`
        INSERT INTO dividends (property_id, user_id, amount, period_label, status)
        VALUES ($1, $2, 124.00, 'Dec 2024', 'paid'),
               ($3, $2, 89.50,  'Dec 2024', 'paid')
      `, [propIds[0], demoUserId, propIds[1]]);
    }

    console.log('✅ Seed complete!');
    console.log('');
    console.log('   👤 Admin  → admin@investr.com  / Admin@123');
    console.log('   👤 Demo   → demo@investr.com   / Demo@123');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
