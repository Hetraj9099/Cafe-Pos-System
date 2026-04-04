const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { USER_ROLES } = require('../utils/constants');

const router = express.Router();

router.post(
  '/login',
  validate({
    email: {
      required: true,
      type: 'string',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Enter a valid email address.'
    },
    password: { required: true, type: 'string', minLength: 8 }
  }),
  authController.login
);

router.post(
  '/register',
  validate({
    name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    email: {
      required: true,
      type: 'string',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Enter a valid email address.'
    },
    password: { required: true, type: 'string', minLength: 8 },
    role: { required: false, enum: USER_ROLES }
  }),
  authController.register
);

router.post(
  '/forgot-password',
  validate({
    email: {
      required: true,
      type: 'string',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Enter a valid email address.'
    }
  }),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  validate({
    email: {
      required: true,
      type: 'string',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Enter a valid email address.'
    },
    otp: { required: true, type: 'string', minLength: 6, maxLength: 6 },
    password: { required: true, type: 'string', minLength: 8 }
  }),
  authController.resetPassword
);

router.get('/profile', authMiddleware, authController.profile);

module.exports = router;