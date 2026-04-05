const orderService = require('../services/order.service');

const listOrders = async (req, res, next) => {
  try {
    const data = await orderService.listOrders(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getKitchenOrders = async (req, res, next) => {
  try {
    const data = await orderService.getKitchenOrders();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const data = await orderService.getOrderById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const data = await orderService.createOrder(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const addOrderItem = async (req, res, next) => {
  try {
    const data = await orderService.addOrderItem(req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const removeOrderItem = async (req, res, next) => {
  try {
    const data = await orderService.removeOrderItem(req.params.id, req.params.itemId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const data = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const markOrderItemPrepared = async (req, res, next) => {
  try {
    const data = await orderService.markItemPrepared(
      req.params.itemId,
      req.body.isPrepared !== false
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const data = await orderService.deleteOrder(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listOrders,
  getKitchenOrders,
  getOrderById,
  createOrder,
  addOrderItem,
  removeOrderItem,
  updateOrderStatus,
  markOrderItemPrepared,
  deleteOrder
};
