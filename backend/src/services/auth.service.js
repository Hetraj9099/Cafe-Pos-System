const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userModel = require('../models/user.model');
const { USER_ROLES } = require('../utils/constants');

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const createAuthToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name
    },
    env.jwtSecret,
    { expiresIn: '12h' }
  );
};

const login = async ({ email, password }) => {
  const user = await userModel.findByEmail(email);

  if (!user || user.password !== hashPassword(password)) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  return {
    token: createAuthToken(user),
    user: userModel.sanitizeUser(user)
  };
};

const register = async ({ name, email, password, role = 'staff' }) => {
  if (!USER_ROLES.includes(role)) {
    const error = new Error('Invalid user role.');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await userModel.findByEmail(email);

  if (existingUser) {
    const error = new Error('User with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  const user = await userModel.createUser({
    name,
    email,
    password: hashPassword(password),
    role
  });

  return {
    token: createAuthToken(user),
    user
  };
};

const getProfile = async (userId) => {
  const user = await userModel.findById(userId);

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = {
  hashPassword,
  login,
  register,
  getProfile
};
