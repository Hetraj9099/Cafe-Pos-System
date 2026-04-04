const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/profile', authMiddleware, authController.profile);

module.exports = router;
