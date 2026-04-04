const { query } = require('./common');

const createOrder = async ({
  tableId = null,
  customerId = null,
  sessionId = null,
  createdBy = null,
  source,
  status = 'created',
  totalAmount = 0,
  estimatedPrepTime = 0
}) => {
  const { rows } = await query(
    `
      INSERT INTO orders (
        table_id,
        customer_id,
        session_id,
        created_by,
        source,
        status,
        total_amount,
        estimated_prep_time
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    [tableId, customerId, sessionId, createdBy, source, status, totalAmount, estimatedPrepTime]
  );

  return rows[0];
};

const findById = async (id) => {
  const { rows } = await query(
    `
      SELECT
        o.*,
        t.table_number,
        c.name AS customer_name,
        c.phone AS customer_phone,
        c.email AS customer_email,
        u.name AS created_by_name
      FROM orders o
      LEFT JOIN tables t ON t.id = o.table_id
      LEFT JOIN customers c ON c.id = o.customer_id
      LEFT JOIN users u ON u.id = o.created_by
      WHERE o.id = $1
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

const listOrders = async ({ status, source, tableId, activeOnly } = {}) => {
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`o.status = $${values.length}`);
  }

  if (source) {
    values.push(source);
    conditions.push(`o.source = $${values.length}`);
  }

  if (tableId) {
    values.push(tableId);
    conditions.push(`o.table_id = $${values.length}`);
  }

  if (activeOnly) {
    conditions.push(`o.status <> 'paid'`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `
      SELECT
        o.*,
        t.table_number,
        c.name AS customer_name,
        c.phone AS customer_phone,
        c.email AS customer_email,
        COUNT(oi.id) AS item_count
      FROM orders o
      LEFT JOIN tables t ON t.id = o.table_id
      LEFT JOIN customers c ON c.id = o.customer_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      ${whereClause}
      GROUP BY o.id, t.id, c.id
      ORDER BY o.created_at DESC
    `,
    values
  );

  return rows;
};

const updateOrder = async (id, payload) => {
  const fields = [];
  const values = [];
  const mapping = {
    tableId: 'table_id',
    customerId: 'customer_id',
    sessionId: 'session_id',
    createdBy: 'created_by',
    source: 'source',
    status: 'status',
    totalAmount: 'total_amount',
    estimatedPrepTime: 'estimated_prep_time'
  };

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && mapping[key]) {
      values.push(value);
      fields.push(`${mapping[key]} = $${values.length}`);
    }
  });

  if (fields.length === 0) {
    return findById(id);
  }

  const { rows } = await query(
    `UPDATE orders SET ${fields.join(', ')} WHERE id = $${values.length + 1} RETURNING *`,
    [...values, id]
  );

  return rows[0] || null;
};

const deleteOrder = async (id) => {
  const { rows } = await query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
  return rows[0] || null;
};

const countActiveOrders = async () => {
  const { rows } = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM orders
      WHERE status IN ('created', 'sent', 'preparing')
    `
  );

  return rows[0]?.count || 0;
};

const listKitchenOrders = async () => {
  const { rows } = await query(
    `
      SELECT
        o.*,
        t.table_number,
        c.name AS customer_name
      FROM orders o
      LEFT JOIN tables t ON t.id = o.table_id
      LEFT JOIN customers c ON c.id = o.customer_id
      WHERE o.status IN ('sent', 'preparing', 'completed')
      ORDER BY o.created_at ASC
    `
  );

  return rows;
};

module.exports = {
  createOrder,
  findById,
  listOrders,
  updateOrder,
  deleteOrder,
  countActiveOrders,
  listKitchenOrders
};
