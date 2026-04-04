const { query } = require('./common');

const createReservation = async ({ customerId, tableId, reservationTime, status = 'reserved' }) => {
  const { rows } = await query(
    `
      INSERT INTO reservations (customer_id, table_id, reservation_time, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [customerId, tableId, reservationTime, status]
  );

  return rows[0];
};

const listReservations = async () => {
  const { rows } = await query(
    `
      SELECT
        r.*,
        c.name AS customer_name,
        c.phone AS customer_phone,
        t.table_number
      FROM reservations r
      LEFT JOIN customers c ON c.id = r.customer_id
      LEFT JOIN tables t ON t.id = r.table_id
      ORDER BY r.reservation_time ASC
    `
  );

  return rows;
};

const findById = async (id) => {
  const { rows } = await query('SELECT * FROM reservations WHERE id = $1 LIMIT 1', [id]);
  return rows[0] || null;
};

const findConflicts = async ({ tableId, reservationTime, intervalMinutes = 120 }) => {
  const { rows } = await query(
    `
      SELECT *
      FROM reservations
      WHERE table_id = $1
        AND status = 'reserved'
        AND reservation_time BETWEEN $2::timestamptz - ($3 || ' minutes')::interval
                                AND $2::timestamptz + ($3 || ' minutes')::interval
    `,
    [tableId, reservationTime, intervalMinutes]
  );

  return rows;
};

module.exports = {
  createReservation,
  listReservations,
  findById,
  findConflicts
};
