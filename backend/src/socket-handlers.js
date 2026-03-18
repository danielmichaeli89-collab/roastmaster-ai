import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import db from './config/database.js';
import RoastMonitor from './services/roast-monitor.service.js';
import { analyzeRoastRealTime } from './services/ai.service.js';

const activeRoasts = new Map();
const roastMonitors = new Map();

export const setupSocketHandlers = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication failed'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication failed'));
      socket.userId = decoded.id;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    socket.on('roast:join', async (data) => {
      const { roast_id } = data;

      try {
        const roast = await db('roasts')
          .where('id', roast_id)
          .andWhere('user_id', socket.userId)
          .first();

        if (!roast) {
          return socket.emit('error', { message: 'Roast not found' });
        }

        socket.join(`roast:${roast_id}`);
        activeRoasts.set(roast_id, {
          roast_id,
          user_id: socket.userId,
          started_at: new Date()
        });

        if (!roastMonitors.has(roast_id)) {
          roastMonitors.set(roast_id, new RoastMonitor());
        }

        socket.emit('roast:joined', {
          roast_id,
          message: 'Successfully joined roast'
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join roast' });
      }
    });

    socket.on('roast:data-point', async (data) => {
      const { roast_id, ...dataPoint } = data;

      try {
        const roast = await db('roasts')
          .where('id', roast_id)
          .andWhere('user_id', socket.userId)
          .first();

        if (!roast) {
          return socket.emit('error', { message: 'Roast not found' });
        }

        const logId = uuidv4();

        await db('temperature_logs').insert({
          id: logId,
          roast_id: roast_id,
          timestamp: new Date(),
          elapsed_seconds: dataPoint.elapsed_seconds,
          bean_temp_1: dataPoint.bean_temp_1,
          bean_temp_2: dataPoint.bean_temp_2,
          air_temp: dataPoint.air_temp,
          inlet_temp: dataPoint.inlet_temp,
          drum_temp: dataPoint.drum_temp,
          exhaust_temp: dataPoint.exhaust_temp,
          drum_pressure: dataPoint.drum_pressure,
          ror_bt: dataPoint.ror_bt,
          ror_et: dataPoint.ror_et,
          power_pct: dataPoint.power_pct,
          airflow_pct: dataPoint.airflow_pct,
          rpm: dataPoint.rpm,
          phase: dataPoint.phase
        });

        const monitor = roastMonitors.get(roast_id);
        if (monitor) {
          monitor.recordDataPoint(dataPoint);

          const profile = roast.profile_id ?
            await db('roast_profiles').where('id', roast.profile_id).first() : null;

          const anomalies = monitor.detectAnomalies(dataPoint, profile);

          if (anomalies.length > 0) {
            for (const anomaly of anomalies) {
              const anomalyId = uuidv4();
              await db('anomaly_logs').insert({
                id: anomalyId,
                roast_id: roast_id,
                elapsed_seconds: dataPoint.elapsed_seconds,
                anomaly_type: anomaly.anomaly_type,
                severity: anomaly.severity,
                description: anomaly.description,
                suggested_action: anomaly.suggested_action,
                ai_generated: anomaly.ai_generated,
                resolved: false
              });

              io.to(`roast:${roast_id}`).emit('roast:anomaly', {
                roast_id,
                ...anomaly
              });
            }
          }
        }

        io.to(`roast:${roast_id}`).emit('roast:data-update', {
          roast_id,
          data: dataPoint,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Data point error:', error);
        socket.emit('error', { message: 'Failed to record data point' });
      }
    });

    socket.on('roast:event', async (data) => {
      const { roast_id, event_type, elapsed_seconds, temperature, description } = data;

      try {
        const roast = await db('roasts')
          .where('id', roast_id)
          .andWhere('user_id', socket.userId)
          .first();

        if (!roast) {
          return socket.emit('error', { message: 'Roast not found' });
        }

        const eventId = uuidv4();

        await db('roast_events').insert({
          id: eventId,
          roast_id: roast_id,
          event_type,
          elapsed_seconds,
          temperature,
          description,
          auto_detected: false
        });

        io.to(`roast:${roast_id}`).emit('roast:event-recorded', {
          roast_id,
          event_type,
          elapsed_seconds,
          temperature
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to record event' });
      }
    });

    socket.on('roast:ai-recommendation', async (data) => {
      const { roast_id, current_data } = data;

      try {
        const roast = await db('roasts')
          .where('id', roast_id)
          .andWhere('user_id', socket.userId)
          .first();

        if (!roast) {
          return socket.emit('error', { message: 'Roast not found' });
        }

        const profile = roast.profile_id ?
          await db('roast_profiles').where('id', roast.profile_id).first() : null;

        const analysis = await analyzeRoastRealTime(current_data, profile);

        io.to(`roast:${roast_id}`).emit('roast:recommendation', {
          roast_id,
          ...analysis
        });
      } catch (error) {
        socket.emit('error', { message: 'AI analysis failed' });
      }
    });

    socket.on('roast:control-change', async (data) => {
      const { roast_id, control_type, value } = data;

      try {
        const roast = await db('roasts')
          .where('id', roast_id)
          .andWhere('user_id', socket.userId)
          .first();

        if (!roast) {
          return socket.emit('error', { message: 'Roast not found' });
        }

        io.to(`roast:${roast_id}`).emit('roast:control-update', {
          roast_id,
          control_type,
          value,
          timestamp: new Date()
        });
      } catch (error) {
        socket.emit('error', { message: 'Control change failed' });
      }
    });

    socket.on('roast:leave', (data) => {
      const { roast_id } = data;
      socket.leave(`roast:${roast_id}`);
      console.log(`User ${socket.userId} left roast ${roast_id}`);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};
