const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userModel = require('../models/user.model');
const emailService = require('./email.service');
const { USER_ROLES } = require('../utils/constants');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9]{10,15}$/;
const passwordMinLength = 8;

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const hashOtp = (otp) => hashPassword(otp);

const normalizeEmail = (email) => email.trim().toLowerCase();

const ensureEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!emailPattern.test(normalizedEmail)) {
    const error = new Error('Enter a valid email address.');
    error.statusCode = 400;
    throw error;
  }

  return normalizedEmail;
};

const ensurePassword = (password) => {
  if (typeof password !== 'string' || password.trim().length < passwordMinLength) {
    const error = new Error(`Password must be at least ${passwordMinLength} characters.`);
    error.statusCode = 400;
    throw error;
  }

  return password;
};

const ensureName = (name) => {
  if (typeof name !== 'string' || name.trim().length < 2) {
    const error = new Error('Name must be at least 2 characters.');
    error.statusCode = 400;
    throw error;
  }

  return name.trim();
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

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
  const normalizedEmail = ensureEmail(email);
  const user = await userModel.findByEmail(normalizedEmail);

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

  const normalizedEmail = ensureEmail(email);
  const safeName = ensureName(name);
  const safePassword = ensurePassword(password);
  const existingUser = await userModel.findByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error('User with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  const user = await userModel.createUser({
    name: safeName,
    email: normalizedEmail,
    password: hashPassword(safePassword),
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

const requestPasswordReset = async ({ email }) => {
  const normalizedEmail = ensureEmail(email);
  const user = await userModel.findByEmail(normalizedEmail);

  if (!user) {
    return {
      requested: true,
      delivered: false,
      message: 'If the email exists, an OTP has been sent.',
      expiresInMinutes: 10
    };
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await userModel.storePasswordResetOtp({
    userId: user.id,
    otpHash: hashOtp(otp),
    expiresAt
  });

  const emailResult = await emailService.sendPasswordResetOtpEmail({
    to: user.email,
    name: user.name,
    otp
  });

  return {
    requested: true,
    delivered: Boolean(emailResult.delivered),
    message: emailResult.delivered
      ? 'OTP sent to the registered email address.'
      : 'OTP generated for local use because email delivery is not configured.',
    expiresInMinutes: 10,
    devOtp: env.nodeEnv !== 'production' && !emailResult.delivered ? otp : undefined
  };
};

const resetPasswordWithOtp = async ({ email, otp, password }) => {
  const normalizedEmail = ensureEmail(email);
  const safePassword = ensurePassword(password);
  const user = await userModel.findByEmail(normalizedEmail);

  if (!user || !user.reset_otp_hash || !user.reset_otp_expires_at) {
    const error = new Error('Request a new OTP before resetting the password.');
    error.statusCode = 400;
    throw error;
  }

  if (new Date(user.reset_otp_expires_at).getTime() < Date.now()) {
    await userModel.clearPasswordResetOtp(user.id);
    const error = new Error('OTP has expired. Request a new code.');
    error.statusCode = 400;
    throw error;
  }

  if (hashOtp(String(otp).trim()) !== user.reset_otp_hash) {
    const error = new Error('OTP is invalid.');
    error.statusCode = 400;
    throw error;
  }

  await userModel.updatePassword(user.id, hashPassword(safePassword));

  return {
    reset: true,
    message: 'Password updated successfully.'
  };
};

module.exports = {
  hashPassword,
  ensureEmail,
  ensureName,
  ensurePassword,
  login,
  register,
  getProfile,
  requestPasswordReset,
  resetPasswordWithOtp,
  phonePattern,
  passwordMinLength,
  emailPattern
};
