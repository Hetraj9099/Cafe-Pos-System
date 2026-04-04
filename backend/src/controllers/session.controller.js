const sessionModel = require('../models/session.model');

const listSessions = async (req, res, next) => {
  try {
    const data = await sessionModel.listSessions();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getSessionById = async (req, res, next) => {
  try {
    const data = await sessionModel.findById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createSession = async (req, res, next) => {
  try {
    const existing = await sessionModel.findOpenByUserId(req.body.userId);

    if (existing) {
      return res.status(200).json({ success: true, data: existing });
    }

    const data = await sessionModel.createSession({ userId: req.body.userId });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const closeSession = async (req, res, next) => {
  try {
    const data = await sessionModel.closeSession(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listSessions,
  getSessionById,
  createSession,
  closeSession
};
