const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  brevoApiKey: process.env.BREVO_API_KEY || '',
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || 'no-reply@poscafe.local',
  brevoSenderName: process.env.BREVO_SENDER_NAME || 'POS Cafe',
  clientBaseUrl: process.env.CLIENT_BASE_URL || 'http://localhost:5173'
};
