const express = require('express');
const tableController = require('../controllers/table.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

router.get('/token/:token', tableController.getTableByToken);
router.get('/', tableController.listTables);
router.get('/:id', tableController.getTableById);
router.get('/:id/status', tableController.getTableStatus);
router.get('/:id/qr', tableController.getTableQr);
router.post(
  '/',
  authMiddleware,
  validate({
    tableNumber: { required: true, type: 'number' },
    seats: { required: true, type: 'number' }
  }),
  tableController.createTable
);
router.put('/:id', authMiddleware, tableController.updateTable);

module.exports = router;
