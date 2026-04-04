const express = require('express');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

router.get('/', productController.listProducts);
router.get('/:id', productController.getProductById);
router.post(
  '/',
  authMiddleware,
  validate({
    name: { required: true, type: 'string' },
    category: { required: true, type: 'string' },
    price: { required: true, type: 'number' },
    tax: { required: true, type: 'number' },
    prepTimeMinutes: { required: true, type: 'number' }
  }),
  productController.createProduct
);
router.put('/:id', authMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);

module.exports = router;