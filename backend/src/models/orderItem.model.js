const { query } = require('./common');

const createOrderItem = async ({ orderId, productId, quantity, unitPrice, totalPrice }) => {
  const { rows } = await query(
    `
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [orderId, productId, quantity, unitPrice, totalPrice]
  );

  return rows[0];
};

const findByOrderAndProduct = async (orderId, productId) => {
  const { rows } = await query(
    `
      SELECT *
      FROM order_items
      WHERE order_id = $1 AND product_id = $2
      ORDER BY id ASC
      LIMIT 1
    `,
    [orderId, productId]
  );

  return rows[0] || null;
};

const listByOrderId = async (orderId) => {
  const { rows } = await query(
    `
      SELECT
        oi.*,
        p.name AS product_name,
        p.category,
        p.prep_time_minutes
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.id ASC
    `,
    [orderId]
  );

  return rows;
};

const findById = async (id) => {
  const { rows } = await query('SELECT * FROM order_items WHERE id = $1 LIMIT 1', [id]);
  return rows[0] || null;
};

const deleteOrderItem = async (orderId, itemId) => {
  const { rows } = await query(
    'DELETE FROM order_items WHERE order_id = $1 AND id = $2 RETURNING *',
    [orderId, itemId]
  );

  return rows[0] || null;
};

const updateQuantity = async (itemId, quantity, totalPrice) => {
  const { rows } = await query(
    `
      UPDATE order_items
      SET quantity = $1,
          total_price = $2
      WHERE id = $3
      RETURNING *
    `,
    [quantity, totalPrice, itemId]
  );

  return rows[0] || null;
};

const updatePrepared = async (itemId, isPrepared) => {
  const { rows } = await query(
    `
      UPDATE order_items
      SET is_prepared = $1
      WHERE id = $2
      RETURNING *
    `,
    [isPrepared, itemId]
  );

  return rows[0] || null;
};

const getSummaryByOrderId = async (orderId) => {
  const { rows } = await query(
    `
      SELECT
        COALESCE(SUM(total_price), 0) AS total_amount,
        COALESCE(MAX(p.prep_time_minutes), 0) AS max_prep_time,
        COALESCE(BOOL_AND(is_prepared), FALSE) AS all_prepared
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $1
    `,
    [orderId]
  );

  return rows[0] || { total_amount: 0, max_prep_time: 0, all_prepared: false };
};

module.exports = {
  createOrderItem,
  findByOrderAndProduct,
  listByOrderId,
  findById,
  deleteOrderItem,
  updateQuantity,
  updatePrepared,
  getSummaryByOrderId
};
