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

const profile = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Profile controller placeholder'
    }
  });
};

module.exports = {
  login,
  register,
  profile
};
