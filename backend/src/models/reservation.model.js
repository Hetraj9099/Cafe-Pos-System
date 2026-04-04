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
        c.email AS customer_email,
        t.table_number
      FROM reservations r
      LEFT JOIN customers c ON c.id = r.customer_id
      LEFT JOIN tables t ON t.id = r.table_id
      ORDER BY r.reservation_time DESC
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

const completeLatestActiveReservationByTable = async (tableId) => {
  const { rows } = await query(
    `
      WITH latest_reservation AS (
        SELECT id
        FROM reservations
        WHERE table_id = $1
          AND status = 'reserved'
        ORDER BY reservation_time DESC, created_at DESC
        LIMIT 1
      )
      UPDATE reservations
      SET status = 'completed'
      WHERE id IN (SELECT id FROM latest_reservation)
      RETURNING *
    `,
    [tableId]
  );

  return rows[0] || null;
};

const completeActiveReservationsUpToTime = async (tableId, cutoffTime) => {
  const { rows } = await query(
    `
      UPDATE reservations
      SET status = 'completed'
      WHERE table_id = $1
        AND status = 'reserved'
        AND reservation_time <= $2::timestamptz
      RETURNING *
    `,
    [tableId, cutoffTime]
  );

  return rows;
};

module.exports = {
  createReservation,
  listReservations,
  findById,
  findConflicts,
  completeLatestActiveReservationByTable,
  completeActiveReservationsUpToTime
};
