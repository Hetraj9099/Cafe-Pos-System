const express = require('express');
const reservationController = require('../controllers/reservation.controller');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

router.get('/availability', reservationController.getAvailability);
router.get('/', reservationController.listReservations);
router.post(
  '/',
  validate({
    tableId: { required: true, type: 'string' },
    reservationTime: { required: true, type: 'string' }
  }),
  reservationController.createReservation
);

module.exports = router;
