const express = require('express');
const sessionController = require('../controllers/session.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', sessionController.listSessions);
router.get('/:id', sessionController.getSessionById);
router.post(
  '/',
  validate({
    userId: { required: true, type: 'string' }
  }),
  sessionController.createSession
);
router.patch('/:id/close', sessionController.closeSession);

module.exports = router;
