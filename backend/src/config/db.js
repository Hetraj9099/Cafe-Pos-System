const { Pool } = require('pg');
const env = require('./env');

const pool = env.databaseUrl
  ? new Pool({
      connectionString: env.databaseUrl,
      ssl: env.databaseUrl.includes('neon.tech')
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
