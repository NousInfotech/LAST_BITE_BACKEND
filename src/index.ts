import { connectDB } from './infrastructure/db/mongoose/connection.js';
import { config } from './config/env.js';
import app from './app.js';

const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
  });
};

startServer();
