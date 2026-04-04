const reservationModel = require('../models/reservation.model');
const preorderModel = require('../models/preorder.model');

const listReservations = async () => ({
  message: 'Reservation listing service placeholder',
  resources: [reservationModel.tableName, preorderModel.tableName]
});

const createReservation = async () => ({
  message: 'Reservation creation service placeholder',
  resource: reservationModel.tableName
});

module.exports = {
  listReservations,
  createReservation
};
