const express = require('express');
const tableController = require('../controllers/table.controller');

const router = express.Router();

router.get('/', tableController.listTables);
router.get('/:id', tableController.getTableById);
router.post('/', tableController.createTable);
router.put('/:id', tableController.updateTable);
router.delete('/:id', tableController.deleteTable);

module.exports = router;
