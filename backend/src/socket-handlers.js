import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import db from './config/database.js';
import RoastMonitor from './services/roast-monitor.service.js';
import { analyzeRoastRealtime } from './services/ai.service.js';

const activeRoasts = new Map();
const roastMonitors = new Map();
let aiAnalysisCounter = 0; // Throttle AI calls to every 3rd data point (30s intervals)

/**
 * SOCKET HANDLERS FOR REAL-TIME ROASTING
 *
 * WebSocket events for live roast monitoring and AI guidance.
 * Events are broadcasted to all clients in the roast room.
 */

export const setupSocketHandlers = (io) => {
  // Authenticate WebSocket connections
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
    console.log(`[SOCKET] User ${socket.userId} connected`);

    /**
     * roast:join
     * Client joins a roast room and initializes monitoring
     */
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

        // Get profile if using one
        const profile = roast.profile_id
          ? await db('roast_profiles').where('id', roast.profile_id).first()
          : null;

        socket.join(`roast:${roast_id}`);

        // Initialize roast monitor if not exists
        if (!roastMonitors.has(roast_id)) {
          const monitor = new RoastMonitor(roast_id, profile);
          roastMonitors.set(roast_id, monitor);
        }

        // Track active roast
        activeRoasts.set(roast_id, {
          roast_id,
          user_id: socket.userId,
          profile_id: roast.profile_id,
          joined_at: new Date()
        });

        socket.emit('roast:joined', {
          roast_id,
          status: 'monitoring_started',
          profile_available: !!profile,
          profile_name: profile?.name,
          message: 'Connected to roast monitoring'
        });

        console.log(`[ROAST] User ${socket.userId} joined roast ${roast_id}`);
      } catch (error) {
        console.error('[SOCKET ERROR] Join failed:', error);
        socket.emit('error', { message: 'Failed to join roast' });
      }
    });

    /**
     * roast:data-point
     * Receive sensor data every 10 seconds
     * This is the main event stream during roasting
     */
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

        // Store data point in database
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
          phase: dataPoint.phase,
          humidity: dataPoint.humidity,
          weight_loss_pct: dataPoint.weight_loss_pct
        });

        // Process through monitor
        const monitor = roastMonitors.get(roast_id);
        if (monitor) {
          monitor.recordDataPoint(dataPoint);

          // Rule-based anomaly detection (instant, no API latency)
          const profile = roast.profile_id
            ? await db('roast_profiles').where('id', roast.profile_id).first()
            : null;

          const anomalies = monitor.detectAnomalies(dataPoint, profile);

          // Broadcast anomalies to all clients in roast room
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
                elapsed_seconds: dataPoint.elapsed_seconds,
                ...anomaly
              });
            }
          }

          // Get current metrics
          const metrics = monitor.calculateMetrics();

          // Broadcast data update to all clients
          io.to(`roast:${roast_id}`).emit('roast:data-update', {
            roast_id,
            data: dataPoint,
            metrics,
            timestamp: new Date(),
            phase: monitor.currentPhase
          });

          // Call AI analysis every 30 seconds (every 3rd data point at 10s intervals)
          aiAnalysisCounter++;
          if (aiAnalysisCounter % 3 === 0) {
            try {
              const aiAnalysis = await analyzeRoastRealtime(
                {
                  ...dataPoint,
                  recent_history: monitor.getRecentData()
                },
                profile,
                [] // Could fetch recent roasts here
              );

              io.to(`roast:${roast_id}`).emit('roast:ai-recommendation', {
                roast_id,
                elapsed_seconds: dataPoint.elapsed_seconds,
                ...aiAnalysis
              });
            } catch (error) {
              console.error('[AI ERROR] Real-time analysis failed:', error);
            }
          }
        }
      } catch (error) {
        console.error('[SOCKET ERROR] Data point processing failed:', error);
        socket.emit('error', { message: 'Failed to record data point' });
      }
    });

    /**
     * roast:event
     * Mark important roasting events (first crack, second crack, drop, etc)
     */
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
          auto_detected: false,
          created_at: new Date()
        });

        // Mark in monitor
        const monitor = roastMonitors.get(roast_id);
        if (monitor) {
          monitor.markEvent(event_type, temperature, description);
        }

        // Broadcast to all clients
        io.to(`roast:${roast_id}`).emit('roast:event-recorded', {
          roast_id,
          event_type,
          elapsed_seconds,
          temperature,
          description
        });

        console.log(`[EVENT] ${event_type} recorded at ${elapsed_seconds}s for roast ${roast_id}`);
      } catch (error) {
        console.error('[SOCKET ERROR] Event recording failed:', error);
        socket.emit('error', { message: 'Failed to record event' });
      }
    });

    /**
     * roast:control-change
     * Broadcast control adjustments (power, airflow, RPM changes)
     */
    socket.on('roast:control-change', async (data) => {
      const { roast_id, control_type, value, reason } = data;

      try {
        const roast = await db('roasts')
          .where('id', roast_id)
          .andWhere('user_id', socket.userId)
          .first();

        if (!roast) {
          return socket.emit('error', { message: 'Roast not found' });
        }

        // Broadcast to all clients so everyone sees the control changes
        io.to(`roast:${roast_id}`).emit('roast:control-update', {
          roast_id,
          control_type,
          value,
          reason,
          timestamp: new Date()
        });

        console.log(`[CONTROL] ${control_type}=${value} for roast ${roast_id}`);
      } catch (error) {
        console.error('[SOCKET ERROR] Control change failed:', error);
        socket.emit('error', { message: 'Control change failed' });
      }
    });

    /**
     * roast:stop
     * End the roast and prepare for analysis
     */
    socket.on('roast:stop', async (data) => {
      const { roast_id, final_metrics } = data;

      try {
        const roast = await db('roasts')
          .where('id', roast_id)
          .andWhere('user_id', socket.userId)
          .first();

        if (!roast) {
          return socket.emit('error', { message: 'Roast not found' });
        }

        // Get monitor metrics
        const monitor = roastMonitors.get(roast_id);
        const metrics = monitor ? monitor.calculateMetrics() : final_metrics;

        // Update roast record with final data
        await db('roasts').where('id', roast_id).update({
          total_duration_seconds: metrics.total_roast_time_seconds,
          first_crack_time: metrics.first_crack_time_seconds,
          first_crack_temp: metrics.first_crack_temp_celsius,
          development_time: metrics.development_time_seconds,
          development_pct: parseFloat(metrics.development_ratio_percent),
          drop_temp: metrics.drop_temp_celsius,
          avg_ror: parseFloat(metrics.avg_ror),
          peak_ror: parseFloat(metrics.peak_ror),
          min_ror: parseFloat(metrics.min_ror),
          weight_loss_pct: parseFloat(metrics.weight_loss_percent),
          status: 'completed',
          completed_at: new Date()
        });

        // Clean up
        roastMonitors.delete(roast_id);
        activeRoasts.delete(roast_id);

        // Notify all clients
        io.to(`roast:${roast_id}`).emit('roast:stopped', {
          roast_id,
          final_metrics: metrics,
          message: 'Roast completed and ready for analysis'
        });

        console.log(`[ROAST] Roast ${roast_id} stopped with metrics:`, metrics);
      } catch (error) {
        console.error('[SOCKET ERROR] Stop roast failed:', error);
        socket.emit('error', { message: 'Failed to stop roast' });
      }
    });

    /**
     * roast:emergency-stop
     * Immediate halt for safety
     */
    socket.on('roast:emergency-stop', async (data) => {
      const { roast_id, reason } = data;

      try {
        io.to(`roast:${roast_id}`).emit('roast:emergency', {
          roast_id,
          reason: reason || 'Emergency stop initiated',
          timestamp: new Date()
        });

        console.error(`[EMERGENCY] Emergency stop for roast ${roast_id}: ${reason}`);
      } catch (error) {
        console.error('[SOCKET ERROR] Emergency stop failed:', error);
      }
    });

    /**
     * roast:leave
     * Client leaves the roast room
     */
    socket.on('roast:leave', (data) => {
      const { roast_id } = data;
      socket.leave(`roast:${roast_id}`);
      console.log(`[ROAST] User ${socket.userId} left roast ${roast_id}`);
    });

    /**
     * disconnect
     * Handle client disconnection
     */
    socket.on('disconnect', () => {
      console.log(`[SOCKET] User ${socket.userId} disconnected`);
    });
  });
};

/**
 * Utility: Get monitor for a roast (used by other services)
 */
export const getRoastMonitor = (roastId) => {
  return roastMonitors.get(roastId);
};

/**
 * Utility: Get active roasts
 */
export const getActiveRoasts = () => {
  return Array.from(activeRoasts.values());
};
