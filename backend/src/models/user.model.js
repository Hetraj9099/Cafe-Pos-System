const { query, buildUpdateClause } = require('./common');

const sanitizeUser = (row) => {
  if (!row) {
    return null;
  }

  const { password, ...safeUser } = row;
  return safeUser;
};

const findByEmail = async (email) => {
  const { rows } = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return rows[0] || null;
};

const findById = async (id) => {
  const { rows } = await query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

const listUsers = async () => {
  const { rows } = await query(
    'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
  );
  return rows;
};

const createUser = async ({ name, email, password, role }) => {
  const { rows } = await query(
    `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at
    `,
    [name, email, password, role]
  );

  return rows[0];
};

const storePasswordResetOtp = async ({ userId, otpHash, expiresAt }) => {
  const { rows } = await query(
    `
      UPDATE users
      SET reset_otp_hash = $1,
          reset_otp_expires_at = $2
      WHERE id = $3
      RETURNING id, name, email, role, created_at
    `,
    [otpHash, expiresAt, userId]
  );

  return rows[0] || null;
};

const clearPasswordResetOtp = async (userId) => {
  const { rows } = await query(
    `
      UPDATE users
      SET reset_otp_hash = NULL,
          reset_otp_expires_at = NULL
      WHERE id = $1
      RETURNING id, name, email, role, created_at
    `,
    [userId]
  );

  return rows[0] || null;
};

const updatePassword = async (userId, password) => {
  const { rows } = await query(
    `
      UPDATE users
      SET password = $1,
          reset_otp_hash = NULL,
          reset_otp_expires_at = NULL
      WHERE id = $2
      RETURNING id, name, email, role, created_at
    `,
    [password, userId]
  );

  return rows[0] || null;
};

const updateUser = async (id, payload) => {
  const { setClause, values } = buildUpdateClause(payload);

  if (!setClause) {
    return findById(id);
  }

  const { rows } = await query(
    `
      UPDATE users
      SET ${setClause}
      WHERE id = $${values.length + 1}
      RETURNING id, name, email, role, created_at
    `,
    [...values, id]
  );

  return rows[0] || null;
};

const deleteUser = async (id) => {
  const { rows } = await query(
    'DELETE FROM users WHERE id = $1 RETURNING id, name, email, role, created_at',
    [id]
  );

  return rows[0] || null;
};

module.exports = {
  sanitizeUser,
  findByEmail,
  findById,
  listUsers,
  createUser,
  storePasswordResetOtp,
  clearPasswordResetOtp,
  updatePassword,
  updateUser,
  deleteUser
};