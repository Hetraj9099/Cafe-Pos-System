const express = require('express');
const paymentController = require('../controllers/payment.controller');
const validate = require('../middleware/validation.middleware');
const { PAYMENT_METHODS } = require('../utils/constants');

const router = express.Router();

router.get('/', paymentController.listPayments);
router.post(
  '/process',
  validate({
    orderId: { required: true, type: 'string' },
    paymentMethod: { required: true, enum: PAYMENT_METHODS },
    amount: { required: true, type: 'number' }
  }),
  paymentController.processPayment
);
router.get('/orders/:orderId/bill', paymentController.downloadBill);
router.post('/orders/:orderId/email', paymentController.emailBill);

module.exports = router;
