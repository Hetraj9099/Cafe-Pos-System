const express = require('express');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

router.get('/cuisines', productController.listCuisines);
router.get('/meta/cuisines', productController.listCuisines);
router.post(
  '/cuisines',
  authMiddleware,
  validate({
    name: { required: true, type: 'string', minLength: 2, maxLength: 100 }
  }),
  productController.createCuisine
);
router.post(
  '/meta/cuisines',
  authMiddleware,
  validate({
    name: { required: true, type: 'string', minLength: 2, maxLength: 100 }
  }),
  productController.createCuisine
);
router.get('/', productController.listProducts);
router.get('/:id', productController.getProductById);
router.post(
  '/',
  authMiddleware,
  validate({
    name: { required: true, type: 'string', minLength: 2, maxLength: 120 },
    category: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    imageUrl: { required: false, type: 'string' },
    price: { required: true, type: 'number' },
    tax: { required: true, type: 'number' },
    prepTimeMinutes: { required: true, type: 'number' }
  }),
  productController.createProduct
);
router.put(
  '/:id',
  authMiddleware,
  validate({
    name: { required: false, type: 'string', minLength: 2, maxLength: 120 },
    category: { required: false, type: 'string', minLength: 2, maxLength: 100 },
    imageUrl: { required: false, type: 'string' },
    price: { required: false, type: 'number' },
    tax: { required: false, type: 'number' },
    prepTimeMinutes: { required: false, type: 'number' },
    isActive: { required: false, type: 'boolean' }
  }),
  productController.updateProduct
);
router.delete('/:id', authMiddleware, productController.deleteProduct);

module.exports = router;
