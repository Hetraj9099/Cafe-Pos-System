const paymentService = require('../services/payment.service');

const listPayments = async (req, res, next) => {
  try {
    const data = await paymentService.listPayments();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getPaymentById = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Payment details controller placeholder',
      id: req.params.id
    }
  });
};

const createPayment = async (req, res, next) => {
  try {
    const data = await paymentService.createPayment(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updatePayment = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Payment update controller placeholder',
      id: req.params.id
    }
  });
};

const deletePayment = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Payment deletion controller placeholder',
      id: req.params.id
    }
  });
};

module.exports = {
  listPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment
};
