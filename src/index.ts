import { connectDB } from './infrastructure/db/mongoose/connection.js';
import { config } from './config/env.js';
import app from './app.js';
import { createServer } from 'http';
import { initSocketServer } from './socket.js';

const startServer = async () => {
  await connectDB();

  const server = createServer(app);
  initSocketServer(server); // 👈 pass HTTP server to socket

  server.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
  });
};

startServer();
