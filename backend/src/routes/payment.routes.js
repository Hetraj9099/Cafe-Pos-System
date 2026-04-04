const express = require('express');
const paymentController = require('../controllers/payment.controller');

const router = express.Router();

router.get('/', paymentController.listPayments);
router.get('/:id', paymentController.getPaymentById);
router.post('/', paymentController.createPayment);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

module.exports = router;
