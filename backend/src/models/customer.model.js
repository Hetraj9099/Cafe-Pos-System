const { query, buildUpdateClause } = require('./common');

const createCustomer = async ({ name, phone, email = null }) => {
  const { rows } = await query(
    `
      INSERT INTO customers (name, phone, email)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [name, phone, email]
  );

  return rows[0];
};

const listCustomers = async () => {
  const { rows } = await query(
    `
      SELECT
        c.*,
        COUNT(DISTINCT o.id) AS orders_count,
        COALESCE(SUM(o.total_amount), 0) AS lifetime_value
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `
  );

  return rows;
};

const findById = async (id) => {
  const { rows } = await query('SELECT * FROM customers WHERE id = $1 LIMIT 1', [id]);
  return rows[0] || null;
};

const findByPhone = async (phone) => {
  const { rows } = await query('SELECT * FROM customers WHERE phone = $1 LIMIT 1', [phone]);
  return rows[0] || null;
};

const updateCustomer = async (id, payload) => {
  const { setClause, values } = buildUpdateClause(payload);

  if (!setClause) {
    return findById(id);
  }

  const { rows } = await query(
    `UPDATE customers SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`,
    [...values, id]
  );

  return rows[0] || null;
};

const deleteCustomer = async (id) => {
  const { rows } = await query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);
  return rows[0] || null;
};

module.exports = {
  createCustomer,
  listCustomers,
  findById,
  findByPhone,
  updateCustomer,
  deleteCustomer
};