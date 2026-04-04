const { query } = require('./common');

const createPreorder = async ({ reservationId, totalAmount, paymentStatus }) => {
  const { rows } = await query(
    `
      INSERT INTO preorders (reservation_id, total_amount, payment_status)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [reservationId, totalAmount, paymentStatus]
  );

  return rows[0];
};

const addPreorderItem = async ({ preorderId, productId, quantity }) => {
  const { rows } = await query(
    `
      INSERT INTO preorder_items (preorder_id, product_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [preorderId, productId, quantity]
  );

  return rows[0];
};

const listPreorderItems = async (preorderId) => {
  const { rows } = await query(
    `
      SELECT
        pi.*,
        p.name AS product_name,
        p.price,
        p.category
      FROM preorder_items pi
      LEFT JOIN products p ON p.id = pi.product_id
      WHERE pi.preorder_id = $1
    `,
    [preorderId]
  );

  return rows;
};

module.exports = {
  createPreorder,
  addPreorderItem,
  listPreorderItems
};
