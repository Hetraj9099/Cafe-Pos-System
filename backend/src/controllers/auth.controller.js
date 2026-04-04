const authService = require('../services/auth.service');

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const profile = async (req, res, next) => {
  try {
    const data = await authService.getProfile(req.user.sub);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const data = await authService.requestPasswordReset(req.body);
    res.status(200).json({ success: true, data, message: data.message });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const data = await authService.resetPasswordWithOtp(req.body);
    res.status(200).json({ success: true, data, message: data.message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  profile,
  forgotPassword,
  resetPassword
};