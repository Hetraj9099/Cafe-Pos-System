const { query, buildUpdateClause } = require('./common');

const listProducts = async ({ activeOnly = false } = {}) => {
  const filters = [];
  const values = [];

  if (activeOnly) {
    values.push(true);
    filters.push(`is_active = $${values.length}`);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT * FROM products ${whereClause} ORDER BY category ASC, name ASC`,
    values
  );

  return rows;
};

const listCuisines = async () => {
  const { rows } = await query('SELECT * FROM cuisines ORDER BY name ASC');
  return rows;
};

const findCuisineByName = async (name) => {
  const { rows } = await query('SELECT * FROM cuisines WHERE LOWER(name) = LOWER($1) LIMIT 1', [
    name
  ]);
  return rows[0] || null;
};

const createCuisine = async (name) => {
  const { rows } = await query(
    `
      INSERT INTO cuisines (name)
      VALUES ($1)
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING *
    `,
    [name]
  );

  return rows[0];
};

const findById = async (id) => {
  const { rows } = await query('SELECT * FROM products WHERE id = $1 LIMIT 1', [id]);
  return rows[0] || null;
};

const createProduct = async ({
  name,
  category,
  imageUrl = null,
  price,
  tax,
  prepTimeMinutes,
  isActive = true
}) => {
  const { rows } = await query(
    `
      INSERT INTO products (
        name,
        category,
        image_url,
        price,
        tax,
        prep_time_minutes,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    [name, category, imageUrl, price, tax, prepTimeMinutes, isActive]
  );

  return rows[0];
};

const updateProduct = async (id, payload) => {
  const { setClause, values } = buildUpdateClause(payload);

  if (!setClause) {
    return findById(id);
  }

  const { rows } = await query(
    `UPDATE products SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`,
    [...values, id]
  );

  return rows[0] || null;
};

const deleteProduct = async (id) => {
  const { rows } = await query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
  return rows[0] || null;
};

const getProductAnalytics = async () => {
  const { rows } = await query(
    `
      SELECT
        p.id,
        p.name,
        p.category,
        COUNT(oi.id)::int AS items_sold,
        COALESCE(SUM(oi.total_price), 0) AS revenue
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      GROUP BY p.id
      ORDER BY items_sold DESC, revenue DESC, p.name ASC
      LIMIT 10
    `
  );

  return rows;
};

module.exports = {
  listProducts,
  listCuisines,
  findCuisineByName,
  createCuisine,
  findById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductAnalytics
};