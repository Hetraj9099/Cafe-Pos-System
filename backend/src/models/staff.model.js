const { query } = require('./common');

const createStaff = async ({ name, role, status = 'active' }) => {
  const { rows } = await query(
    `
      INSERT INTO staff (name, role, status)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [name, role, status]
  );

  return rows[0];
};

const findStaffById = async (id) => {
  const { rows } = await query('SELECT * FROM staff WHERE id = $1 LIMIT 1', [id]);
  return rows[0] || null;
};

const updateStaff = async (id, { name, role, status }) => {
  const { rows } = await query(
    `
      UPDATE staff
      SET
        name = COALESCE($1, name),
        role = COALESCE($2, role),
        status = COALESCE($3, status)
      WHERE id = $4
      RETURNING *
    `,
    [name ?? null, role ?? null, status ?? null, id]
  );

  return rows[0] || null;
};

const deleteStaff = async (id) => {
  const { rows } = await query('DELETE FROM staff WHERE id = $1 RETURNING *', [id]);
  return rows[0] || null;
};

const listStaff = async () => {
  const { rows } = await query(
    `
      SELECT
        s.*,
        a.date AS attendance_date,
        a.status AS attendance_status
      FROM staff s
      LEFT JOIN LATERAL (
        SELECT date, status
        FROM attendance
        WHERE staff_id = s.id
        ORDER BY date DESC
        LIMIT 1
      ) a ON TRUE
      ORDER BY s.name ASC
    `
  );

  return rows;
};

module.exports = {
  createStaff,
  findStaffById,
  updateStaff,
  deleteStaff,
  listStaff
};
