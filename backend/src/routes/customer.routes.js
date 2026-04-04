const express = require('express');
const customerController = require('../controllers/customer.controller');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

router.get('/', customerController.listCustomers);
router.get('/:id', customerController.getCustomerById);
router.post(
  '/',
  validate({
    name: { required: true, type: 'string' },
    phone: { required: true, type: 'string' },
    email: { required: false, type: 'string' }
  }),
  customerController.createCustomer
);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;