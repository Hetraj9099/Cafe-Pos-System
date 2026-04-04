const { query } = require('./common');

const createStaff = async ({ name, role, status }) => {
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
  listStaff
};
