const { query, buildUpdateClause } = require('./common');

const createTable = async ({ tableNumber, qrToken, seats }) => {
  const { rows } = await query(
    `
      INSERT INTO tables (table_number, qr_token, seats)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [tableNumber, qrToken, seats]
  );

  return rows[0];
};

const listTables = async () => {
  const { rows } = await query('SELECT * FROM tables ORDER BY table_number ASC');
  return rows;
};

const findById = async (id) => {
  const { rows } = await query('SELECT * FROM tables WHERE id = $1 LIMIT 1', [id]);
  return rows[0] || null;
};

const findByToken = async (token) => {
  const { rows } = await query('SELECT * FROM tables WHERE qr_token = $1 LIMIT 1', [token]);
  return rows[0] || null;
};

const getLatestOrdersByTable = async () => {
  const { rows } = await query(
    `
      SELECT DISTINCT ON (table_id)
        id,
        table_id,
        status,
        total_amount,
        created_at
      FROM orders
      WHERE table_id IS NOT NULL
      ORDER BY table_id, created_at DESC
    `
  );

  return rows;
};

const getActiveReservations = async (fromTime, toTime) => {
  const { rows } = await query(
    `
      SELECT
        r.*,
        c.name AS customer_name,
        c.phone AS customer_phone,
        c.email AS customer_email
      FROM reservations r
      LEFT JOIN customers c ON c.id = r.customer_id
      WHERE status = 'reserved'
        AND reservation_time BETWEEN $1 AND $2
    `,
    [fromTime, toTime]
  );

  return rows;
};

const updateTable = async (id, payload) => {
  const { setClause, values } = buildUpdateClause(payload);

  if (!setClause) {
    return findById(id);
  }

  const { rows } = await query(
    `UPDATE tables SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`,
    [...values, id]
  );

  return rows[0] || null;
};

module.exports = {
  createTable,
  listTables,
  findById,
  findByToken,
  getLatestOrdersByTable,
  getActiveReservations,
  updateTable
};
