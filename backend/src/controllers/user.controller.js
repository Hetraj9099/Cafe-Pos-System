const attendanceModel = require('../models/attendance.model');
const staffModel = require('../models/staff.model');
const userModel = require('../models/user.model');
const authService = require('../services/auth.service');

const listUsers = async (req, res, next) => {
  try {
    const data = await userModel.listUsers();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const data = await userModel.findById(req.params.id);

    if (!data) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const data = await userModel.createUser({
      ...req.body,
      password: authService.hashPassword(req.body.password)
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (payload.password) {
      payload.password = authService.hashPassword(payload.password);
    }

    const data = await userModel.updateUser(req.params.id, payload);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const data = await userModel.deleteUser(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const listStaff = async (req, res, next) => {
  try {
    const data = await staffModel.listStaff();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createStaff = async (req, res, next) => {
  try {
    const data = await staffModel.createStaff(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateStaff = async (req, res, next) => {
  try {
    const data = await staffModel.updateStaff(req.params.id, req.body);

    if (!data) {
      const error = new Error('Staff member not found.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const deleteStaff = async (req, res, next) => {
  try {
    const data = await staffModel.deleteStaff(req.params.id);

    if (!data) {
      const error = new Error('Staff member not found.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const listAttendance = async (req, res, next) => {
  try {
    const data = await attendanceModel.listAttendance(req.query.date || null);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const markAttendance = async (req, res, next) => {
  try {
    const data = await attendanceModel.upsertAttendance({
      staffId: req.body.staffId,
      date: req.body.date,
      status: req.body.status
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  listStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  listAttendance,
  markAttendance
};
