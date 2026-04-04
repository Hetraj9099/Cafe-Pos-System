const orderModel = require('../models/order.model');
const paymentModel = require('../models/payment.model');
const reservationModel = require('../models/reservation.model');
const { PAYMENT_METHODS } = require('../utils/constants');
const orderService = require('./order.service');
const pdfService = require('./pdf.service');
const emailService = require('./email.service');

const processPayment = async ({ orderId, paymentMethod, amount }) => {
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    const error = new Error('Invalid payment method.');
    error.statusCode = 400;
    throw error;
  }

  const order = await orderService.getOrderById(orderId);

  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  const numericAmount = Number(amount);

  if (numericAmount < Number(order.total_amount)) {
    const error = new Error('Payment amount is less than the order total.');
    error.statusCode = 400;
    throw error;
  }

  const payment = await paymentModel.createPayment({
    orderId,
    paymentMethod,
    amount: numericAmount
  });

  await orderModel.updateOrder(orderId, { status: 'paid' });

  if (order.table_id) {
    await reservationModel.completeActiveReservationsUpToTime(
      order.table_id,
      order.created_at || new Date().toISOString()
    );
  }

  return {
    payment,
    order: await orderService.getOrderById(orderId)
  };
};

const listPayments = async () => {
  return paymentModel.listPayments();
};

const buildBillBuffer = async (orderId) => {
  const order = await orderService.getOrderById(orderId);
  const payments = await paymentModel.listByOrderId(orderId);

  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  return pdfService.generateBillPdfBuffer({ order, payments });
};

const emailBill = async ({ orderId, email }) => {
  const billBuffer = await buildBillBuffer(orderId);
  const order = await orderService.getOrderById(orderId);

  return emailService.sendBillEmail({
    to: email || order.customer_email,
    order,
    pdfBuffer: billBuffer
  });
};

module.exports = {
  processPayment,
  listPayments,
  buildBillBuffer,
  emailBill
};