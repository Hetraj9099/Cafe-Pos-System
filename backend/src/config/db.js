const { Pool } = require('pg');
const env = require('./env');

const databaseUrl = env.databaseUrl || process.env.DATABASE_URL || '';

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : undefined
    })
  : null;

const query = async (text, params = []) => {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured.');
  }

  return pool.query(text, params);
};

const testConnection = async () => {
  if (!pool) {
    console.warn('Database connection skipped: DATABASE_URL is not configured.');
    return;
  }

  await pool.query('SELECT 1');
  console.log('Database connection established.');
};

module.exports = {
  pool,
  query,
  testConnection
};