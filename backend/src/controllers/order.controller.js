const orderService = require('../services/order.service');

const listOrders = async (req, res, next) => {
  try {
    const data = await orderService.listOrders();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Order details controller placeholder',
      id: req.params.id
    }
  });
};

const createOrder = async (req, res, next) => {
  try {
    const data = await orderService.createOrder(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Order update controller placeholder',
      id: req.params.id
    }
  });
};

const deleteOrder = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Order deletion controller placeholder',
      id: req.params.id
    }
  });
};

module.exports = {
  listOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
};
