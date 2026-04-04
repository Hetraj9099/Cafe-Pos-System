const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

router.get('/overview', dashboardController.getOverview);

module.exports = router;
