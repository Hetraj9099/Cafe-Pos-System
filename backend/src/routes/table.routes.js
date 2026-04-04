const express = require('express');
const tableController = require('../controllers/table.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { TABLE_STATUS_VALUES } = require('../utils/constants');

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
router.put(
  '/:id',
  authMiddleware,
  validate({
    tableNumber: { required: false, type: 'number' },
    seats: { required: false, type: 'number' },
    manualStatus: { required: false, enum: TABLE_STATUS_VALUES }
  }),
  tableController.updateTable
);

module.exports = router;
