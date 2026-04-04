const express = require('express');
const customerController = require('../controllers/customer.controller');
const validate = require('../middleware/validation.middleware');

const router = express.Router();
const customerValidation = {
  name: { required: false, type: 'string', minLength: 2, maxLength: 100 },
  phone: {
    required: false,
    type: 'string',
    pattern: /^[0-9]{10}$/,
    patternMessage: 'Phone number must contain exactly 10 digits.'
  },
  email: {
    required: false,
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'Enter a valid email address.'
  }
};

router.get('/', customerController.listCustomers);
router.get('/:id', customerController.getCustomerById);
router.post(
  '/',
  validate({
    ...customerValidation,
    name: { ...customerValidation.name, required: true },
    phone: { ...customerValidation.phone, required: true }
  }),
  customerController.createCustomer
);
router.put('/:id', validate(customerValidation), customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
