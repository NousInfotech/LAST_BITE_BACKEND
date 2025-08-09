import { connectDB } from './infrastructure/db/mongoose/connection.js';
import { config } from './config/env.js';
import app from './app.js';
import { createServer } from 'http';
import getPort from 'get-port';
import { initSocketServer } from './socket.js';

const startServer = async () => {
  await connectDB();

  const desiredPort = config.port;
  const port = await getPort({ port: desiredPort });

  const server = createServer(app);
  initSocketServer(server);

  server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
};

startServer();
