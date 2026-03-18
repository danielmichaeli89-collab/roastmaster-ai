import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import db from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { setupSocketHandlers } from './socket-handlers.js';

import authRoutes from './routes/auth.routes.js';
import coffeesRoutes from './routes/coffees.routes.js';
import profilesRoutes from './routes/profiles.routes.js';
import roastsRoutes from './routes/roasts.routes.js';
import importRoutes from './routes/import.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import aiRoutes from './routes/ai.routes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3000').split(','),
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',')
}));

app.use('/api/auth', authRoutes);
app.use('/api/coffees', coffeesRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/roasts', roastsRoutes);
app.use('/api/import', importRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

setupSocketHandlers(io);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('Database connected successfully');

    httpServer.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
      console.log(`WebSocket server listening on ws://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
