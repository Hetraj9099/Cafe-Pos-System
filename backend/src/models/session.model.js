const { query } = require('./common');

const createSession = async ({ userId, status = 'open' }) => {
  const { rows } = await query(
    `
      INSERT INTO sessions (user_id, status)
      VALUES ($1, $2)
      RETURNING *
    `,
    [userId, status]
  );

  return rows[0];
};

const listSessions = async () => {
  const { rows } = await query(
    `
      SELECT
        s.*,
        u.name AS user_name,
        u.email AS user_email
      FROM sessions s
      LEFT JOIN users u ON u.id = s.user_id
      ORDER BY s.opened_at DESC
    `
  );

  return rows;
};

const findById = async (id) => {
  const { rows } = await query('SELECT * FROM sessions WHERE id = $1 LIMIT 1', [id]);
  return rows[0] || null;
};

const findOpenByUserId = async (userId) => {
  const { rows } = await query(
    `
      SELECT *
      FROM sessions
      WHERE user_id = $1 AND status = 'open'
      ORDER BY opened_at DESC
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
};

const closeSession = async (id) => {
  const { rows } = await query(
    `
      UPDATE sessions
      SET status = 'closed', closed_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );

  return rows[0] || null;
};

module.exports = {
  createSession,
  listSessions,
  findById,
  findOpenByUserId,
  closeSession
};
