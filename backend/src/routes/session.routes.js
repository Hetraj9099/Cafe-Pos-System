const express = require('express');
const sessionController = require('../controllers/session.controller');

const router = express.Router();

router.get('/', sessionController.listSessions);
router.get('/:id', sessionController.getSessionById);
router.post('/', sessionController.createSession);
router.put('/:id', sessionController.updateSession);
router.delete('/:id', sessionController.deleteSession);

module.exports = router;
