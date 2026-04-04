const { query } = require('./common');

const createPayment = async ({ orderId, paymentMethod, amount, status = 'completed' }) => {
  const { rows } = await query(
    `
      INSERT INTO payments (order_id, payment_method, amount, status, paid_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `,
    [orderId, paymentMethod, amount, status]
  );

  return rows[0];
};

const listPayments = async () => {
  const { rows } = await query(
    `
      SELECT
        p.*,
        o.source,
        o.status AS order_status
      FROM payments p
      LEFT JOIN orders o ON o.id = p.order_id
      ORDER BY p.paid_at DESC NULLS LAST
    `
  );

  return rows;
};

const listByOrderId = async (orderId) => {
  const { rows } = await query(
    'SELECT * FROM payments WHERE order_id = $1 ORDER BY paid_at DESC NULLS LAST',
    [orderId]
  );

  return rows;
};

const getPaymentBreakdown = async () => {
  const { rows } = await query(
    `
      SELECT
        payment_method,
        COUNT(*) AS payments_count,
        COALESCE(SUM(amount), 0) AS total_amount
      FROM payments
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `
  );

  return rows;
};

module.exports = {
  createPayment,
  listPayments,
  listByOrderId,
  getPaymentBreakdown
};
