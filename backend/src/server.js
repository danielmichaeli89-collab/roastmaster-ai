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

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/coffees', coffeesRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/roasts', roastsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

setupSocketHandlers(io);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    // Test database connection with timeout
    await Promise.race([
      db.raw('SELECT 1'),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database connection timeout')), 10000)
      )
    ]);

    console.log('Database connected successfully');

    httpServer.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
      console.log(`WebSocket server listening on ws://${HOST}:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('HTTP server closed');
    db.destroy();
    process.exit(0);
  });
});

export default app;
