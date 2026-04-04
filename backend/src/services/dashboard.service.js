const attendanceModel = require('../models/attendance.model');
const paymentModel = require('../models/payment.model');
const productModel = require('../models/product.model');
const staffModel = require('../models/staff.model');
const { query } = require('../models/common');

const getOverview = async () => {
  const [
    sales,
    trends,
    payments,
    products,
    customers,
    staff,
    attendance
  ] = await Promise.all([
    query(
      `
        SELECT
          COUNT(*) FILTER (WHERE status = 'paid') AS paid_orders,
          COUNT(*) AS total_orders,
          COALESCE(SUM(total_amount) FILTER (WHERE status = 'paid'), 0) AS total_revenue
        FROM orders
        WHERE created_at::date = CURRENT_DATE
      `
    ),
    query(
      `
        SELECT
          created_at::date AS day,
          COUNT(*) AS orders_count,
          COALESCE(SUM(total_amount) FILTER (WHERE status = 'paid'), 0) AS revenue
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY created_at::date
        ORDER BY day ASC
      `
    ),
    paymentModel.getPaymentBreakdown(),
    productModel.getProductAnalytics(),
    query(
      `
        SELECT
          COUNT(*) AS total_customers,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS new_customers_30d
        FROM customers
      `
    ),
    staffModel.listStaff(),
    attendanceModel.listAttendance()
  ]);

  return {
    sales: sales.rows[0] || {},
    trends: trends.rows,
    paymentBreakdown: payments,
    productAnalytics: products,
    customerStats: customers.rows[0] || {},
    staffOverview: staff,
    attendance
  };
};

module.exports = {
  getOverview
};
