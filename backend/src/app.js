const cors = require('cors');
const express = require('express');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const customerRoutes = require('./routes/customer.routes');
const tableRoutes = require('./routes/table.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const sessionRoutes = require('./routes/session.routes');
const reservationRoutes = require('./routes/reservation.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const errorMiddleware = require('./middleware/error.middleware');
const { DEFAULT_API_PREFIX } = require('./utils/constants');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Restaurant POS backend is running.'
  });
});

app.use(`${DEFAULT_API_PREFIX}/auth`, authRoutes);
app.use(`${DEFAULT_API_PREFIX}/users`, userRoutes);
app.use(`${DEFAULT_API_PREFIX}/customers`, customerRoutes);
app.use(`${DEFAULT_API_PREFIX}/tables`, tableRoutes);
app.use(`${DEFAULT_API_PREFIX}/products`, productRoutes);
app.use(`${DEFAULT_API_PREFIX}/orders`, orderRoutes);
app.use(`${DEFAULT_API_PREFIX}/payments`, paymentRoutes);
app.use(`${DEFAULT_API_PREFIX}/sessions`, sessionRoutes);
app.use(`${DEFAULT_API_PREFIX}/reservations`, reservationRoutes);
app.use(`${DEFAULT_API_PREFIX}/dashboard`, dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorMiddleware);

module.exports = app;
