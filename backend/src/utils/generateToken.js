const crypto = require('crypto');

const generateToken = (prefix = 'token') => {
  return `${prefix}-${crypto.randomBytes(6).toString('hex')}`;
};

module.exports = generateToken;
