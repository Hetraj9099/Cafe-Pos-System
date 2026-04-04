const express = require('express');
const orderController = require('../controllers/order.controller');
const validate = require('../middleware/validation.middleware');
const { ORDER_SOURCES, ORDER_STATUS } = require('../utils/constants');

const router = express.Router();

router.get('/kitchen/active', orderController.getKitchenOrders);
router.get('/', orderController.listOrders);
router.get('/:id', orderController.getOrderById);
router.post(
  '/',
  validate({
    source: { required: true, enum: ORDER_SOURCES },
    items: { required: true, type: 'array' }
  }),
  orderController.createOrder
);
router.post(
  '/:id/items',
  validate({
    productId: { required: true, type: 'string' },
    quantity: { required: true, type: 'number' }
  }),
  orderController.addOrderItem
);
router.delete('/:id/items/:itemId', orderController.removeOrderItem);
router.patch(
  '/:id/status',
  validate({
    status: { required: true, enum: ORDER_STATUS }
  }),
  orderController.updateOrderStatus
);
router.patch('/items/:itemId/prepared', orderController.markOrderItemPrepared);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
