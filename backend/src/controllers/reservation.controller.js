const reservationService = require('../services/reservation.service');

const listReservations = async (req, res, next) => {
  try {
    const data = await reservationService.listReservations();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getReservationById = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Reservation details controller placeholder',
      id: req.params.id
    }
  });
};

const createReservation = async (req, res, next) => {
  try {
    const data = await reservationService.createReservation(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateReservation = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Reservation update controller placeholder',
      id: req.params.id
    }
  });
};

const deleteReservation = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Reservation deletion controller placeholder',
      id: req.params.id
    }
  });
};

module.exports = {
  listReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation
};
