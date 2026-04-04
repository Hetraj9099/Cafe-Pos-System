const fs = require('fs');
const path = require('path');
const { pool, testConnection } = require('../config/db');

const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');

const initDb = async () => {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  await testConnection();
  await pool.query(schemaSql);

  console.log('Database schema initialized successfully.');
};

initDb()
  .catch((error) => {
    console.error('Database initialization failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (pool) {
      await pool.end();
    }
  });
