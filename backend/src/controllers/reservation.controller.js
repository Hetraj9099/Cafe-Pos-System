const reservationService = require('../services/reservation.service');

const listReservations = async (req, res, next) => {
  try {
    const data = await reservationService.listReservations();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getAvailability = async (req, res, next) => {
  try {
    const data = await reservationService.getAvailability(req.query.reservationTime);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createReservation = async (req, res, next) => {
  try {
    const data = await reservationService.createReservation(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listReservations,
  getAvailability,
  createReservation
};
