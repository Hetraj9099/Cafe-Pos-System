const app = require('./app');
const env = require('./config/env');
const { testConnection } = require('./config/db');

const startServer = async () => {
  try {
    await testConnection();

    app.listen(env.port, () => {
      console.log(`Backend server listening on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
