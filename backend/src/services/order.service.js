const orderModel = require('../models/order.model');
const orderItemModel = require('../models/orderItem.model');

const listOrders = async () => ({
  message: 'Order listing service placeholder',
  resources: [orderModel.tableName, orderItemModel.tableName]
});

const createOrder = async () => ({
  message: 'Order creation service placeholder',
  resource: orderModel.tableName
});

module.exports = {
  listOrders,
  createOrder
};
