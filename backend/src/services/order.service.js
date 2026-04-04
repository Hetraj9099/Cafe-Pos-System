const customerModel = require('../models/customer.model');
const orderItemModel = require('../models/orderItem.model');
const orderModel = require('../models/order.model');
const productModel = require('../models/product.model');
const tableModel = require('../models/table.model');
const estimateTime = require('../utils/timeEstimator');
const { ORDER_SOURCES, ORDER_STATUS } = require('../utils/constants');

const ensureOrderExists = async (orderId) => {
  const order = await orderModel.findById(orderId);

  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  return order;
};

const enrichOrder = async (order) => {
  const items = await orderItemModel.listByOrderId(order.id);
  return {
    ...order,
    items
  };
};

const syncOrderTotals = async (orderId) => {
  const summary = await orderItemModel.getSummaryByOrderId(orderId);
  const activeOrders = await orderModel.countActiveOrders();
  const estimate = estimateTime({
    maxPrepTime: summary.max_prep_time,
    activeOrders
  });

  const statusUpdate =
    summary.all_prepared && Number(summary.total_amount) > 0 ? { status: 'completed' } : {};

  const updatedOrder = await orderModel.updateOrder(orderId, {
    totalAmount: Number(summary.total_amount),
    estimatedPrepTime: estimate.minutes,
    ...statusUpdate
  });

  return enrichOrder(await orderModel.findById(updatedOrder.id));
};

const ensureCustomer = async (payload) => {
  if (payload.customerId) {
    return payload.customerId;
  }

  if (!payload.customer) {
    return null;
  }

  const existingCustomer = await customerModel.findByPhone(payload.customer.phone);

  if (existingCustomer) {
    return existingCustomer.id;
  }

  const customer = await customerModel.createCustomer(payload.customer);
  return customer.id;
};

const listOrders = async (filters = {}) => {
  const orders = await orderModel.listOrders(filters);
  return Promise.all(orders.map(enrichOrder));
};

const getOrderById = async (orderId) => {
  const order = await ensureOrderExists(orderId);
  return enrichOrder(order);
};

const createOrder = async (payload) => {
  if (!ORDER_SOURCES.includes(payload.source)) {
    const error = new Error('Invalid order source.');
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    const error = new Error('Order must contain at least one item.');
    error.statusCode = 400;
    throw error;
  }

  if (payload.tableId) {
    const table = await tableModel.findById(payload.tableId);
    if (!table) {
      const error = new Error('Selected table was not found.');
      error.statusCode = 404;
      throw error;
    }
  }

  const customerId = await ensureCustomer(payload);
  const order = await orderModel.createOrder({
    tableId: payload.tableId || null,
    customerId,
    sessionId: payload.sessionId || null,
    createdBy: payload.createdBy || null,
    source: payload.source,
    status: payload.sendToKitchen ? 'sent' : 'created'
  });

  for (const item of payload.items) {
    const product = await productModel.findById(item.productId);

    if (!product || !product.is_active) {
      const error = new Error('One or more selected products are unavailable.');
      error.statusCode = 400;
      throw error;
    }

    const quantity = Number(item.quantity || 1);
    await orderItemModel.createOrderItem({
      orderId: order.id,
      productId: product.id,
      quantity,
      unitPrice: Number(product.price),
      totalPrice: Number(product.price) * quantity
    });
  }

  return syncOrderTotals(order.id);
};

const addOrderItem = async (orderId, payload) => {
  await ensureOrderExists(orderId);

  const product = await productModel.findById(payload.productId);

  if (!product || !product.is_active) {
    const error = new Error('Product not found or inactive.');
    error.statusCode = 404;
    throw error;
  }

  const quantity = Number(payload.quantity || 1);

  await orderItemModel.createOrderItem({
    orderId,
    productId: product.id,
    quantity,
    unitPrice: Number(product.price),
    totalPrice: Number(product.price) * quantity
  });

  return syncOrderTotals(orderId);
};

const removeOrderItem = async (orderId, itemId) => {
  await ensureOrderExists(orderId);
  const deletedItem = await orderItemModel.deleteOrderItem(orderId, itemId);

  if (!deletedItem) {
    const error = new Error('Order item not found.');
    error.statusCode = 404;
    throw error;
  }

  return syncOrderTotals(orderId);
};

const updateOrderStatus = async (orderId, status) => {
  if (!ORDER_STATUS.includes(status)) {
    const error = new Error('Invalid order status.');
    error.statusCode = 400;
    throw error;
  }

  await ensureOrderExists(orderId);
  const updatedOrder = await orderModel.updateOrder(orderId, { status });
  return enrichOrder(await orderModel.findById(updatedOrder.id));
};

const markItemPrepared = async (itemId, isPrepared = true) => {
  const item = await orderItemModel.findById(itemId);

  if (!item) {
    const error = new Error('Order item not found.');
    error.statusCode = 404;
    throw error;
  }

  await orderItemModel.updatePrepared(itemId, isPrepared);
  return syncOrderTotals(item.order_id);
};

const getKitchenOrders = async () => {
  const orders = await orderModel.listKitchenOrders();
  return Promise.all(orders.map(enrichOrder));
};

const deleteOrder = async (orderId) => {
  const deletedOrder = await orderModel.deleteOrder(orderId);

  if (!deletedOrder) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  return deletedOrder;
};

module.exports = {
  listOrders,
  getOrderById,
  createOrder,
  addOrderItem,
  removeOrderItem,
  updateOrderStatus,
  markItemPrepared,
  getKitchenOrders,
  deleteOrder
};
