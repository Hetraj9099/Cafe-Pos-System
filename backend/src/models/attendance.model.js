const { query } = require('./common');

const upsertAttendance = async ({ staffId, date, status }) => {
  const { rows } = await query(
    `
      INSERT INTO attendance (staff_id, date, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (staff_id, date)
      DO UPDATE SET status = EXCLUDED.status
      RETURNING *
    `,
    [staffId, date, status]
  );

  return rows[0];
};

const listAttendance = async (date = null) => {
  const values = [];
  let whereClause = '';

  if (date) {
    values.push(date);
    whereClause = `WHERE a.date = $${values.length}`;
  }

  const { rows } = await query(
    `
      SELECT
        a.*,
        s.name AS staff_name,
        s.role AS staff_role
      FROM attendance a
      INNER JOIN staff s ON s.id = a.staff_id
      ${whereClause}
      ORDER BY a.date DESC, s.name ASC
    `,
    values
  );

  return rows;
};

module.exports = {
  upsertAttendance,
  listAttendance
};