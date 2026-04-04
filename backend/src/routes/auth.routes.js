const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { USER_ROLES } = require('../utils/constants');

const router = express.Router();

router.post(
  '/login',
  validate({
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string' }
  }),
  authController.login
);

router.post(
  '/register',
  validate({
    name: { required: true, type: 'string' },
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string' },
    role: { required: false, enum: USER_ROLES }
  }),
  authController.register
);

router.get('/profile', authMiddleware, authController.profile);

module.exports = router;