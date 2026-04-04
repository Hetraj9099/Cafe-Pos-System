const userModel = require('../models/user.model');

const login = async () => ({
  message: 'Login service placeholder',
  resource: userModel.tableName
});

const register = async () => ({
  message: 'Register service placeholder',
  resource: userModel.tableName
});

module.exports = {
  login,
  register
};
