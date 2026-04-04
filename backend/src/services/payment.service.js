const paymentModel = require('../models/payment.model');

const listPayments = async () => ({
  message: 'Payment listing service placeholder',
  resource: paymentModel.tableName
});

const createPayment = async () => ({
  message: 'Payment creation service placeholder',
  resource: paymentModel.tableName
});

module.exports = {
  listPayments,
  createPayment
};
