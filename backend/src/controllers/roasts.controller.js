import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { analyzeRoastPost, analyzeRoastRealTime } from '../services/ai.service.js';

export const listRoasts = async (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query;

  try {
    let query = db('roasts')
      .select('*')
      .where('user_id', req.user.id);

    if (status) {
      query = query.andWhere('status', status);
    }

    const roasts = await query
      .orderBy('start_time', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    return res.json(roasts);
  } catch (error) {
    console.error('List roasts error:', error);
    return res.status(500).json({ error: 'Failed to fetch roasts' });
  }
};

export const getRoast = async (req, res) => {
  const { id } = req.params;

  try {
    const roast = await db('roasts')
      .where('id', id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!roast) {
      return res.status(404).json({ error: 'Roast not found' });
    }

    const temperatureLogs = await db('temperature_logs')
      .where('roast_id', id)
      .orderBy('elapsed_seconds', 'asc');

    const events = await db('roast_events')
      .where('roast_id', id)
      .orderBy('elapsed_seconds', 'asc');

    const anomalies = await db('anomaly_logs')
      .where('roast_id', id)
      .orderBy('created_at', 'asc');

    return res.json({
      ...roast,
      temperatureLogs,
      events,
      anomalies
    });
  } catch (error) {
    console.error('Get roast error:', error);
    return res.status(500).json({ error: 'Failed to fetch roast' });
  }
};

export const createRoast = async (req, res) => {
  const {
    profile_id,
    green_coffee_id,
    batch_weight_g,
    charge_temp,
    ambient_temperature,
    ambient_humidity_percent
  } = req.body;

  if (!batch_weight_g) {
    return res.status(400).json({ error: 'Batch weight required' });
  }

  try {
    const roastId = uuidv4();

    await db('roasts').insert({
      id: roastId,
      user_id: req.user.id,
      profile_id,
      green_coffee_id,
      status: 'planned',
      batch_weight_g,
      charge_temp: charge_temp || 195,
      start_time: new Date(),
      ambient_temperature,
      ambient_humidity_percent
    });

    const roast = await db('roasts').where('id', roastId).first();

    return res.status(201).json(roast);
  } catch (error) {
    console.error('Create roast error:', error);
    return res.status(500).json({ error: 'Failed to create roast' });
  }
};

export const startRoast = async (req, res) => {
  const { id } = req.params;

  try {
    const roast = await db('roasts')
      .where('id', id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!roast) {
      return res.status(404).json({ error: 'Roast not found' });
    }

    if (roast.status !== 'planned') {
      return res.status(400).json({
        error: 'Only planned roasts can be started'
      });
    }

    await db('roasts')
      .where('id', id)
      .update({
        status: 'in_progress',
        start_time: new Date()
      });

    const updated = await db('roasts').where('id', id).first();

    return res.json(updated);
  } catch (error) {
    console.error('Start roast error:', error);
    return res.status(500).json({ error: 'Failed to start roast' });
  }
};

export const stopRoast = async (req, res) => {
  const { id } = req.params;

  try {
    const roast = await db('roasts')
      .where('id', id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!roast) {
      return res.status(404).json({ error: 'Roast not found' });
    }

    if (roast.status !== 'in_progress') {
      return res.status(400).json({
        error: 'Only in-progress roasts can be stopped'
      });
    }

    const endTime = new Date();
    const duration = Math.floor((endTime - roast.start_time) / 1000);

    await db('roasts')
      .where('id', id)
      .update({
        status: 'completed',
        end_time: endTime,
        total_duration: duration
      });

    const updated = await db('roasts').where('id', id).first();

    return res.json(updated);
  } catch (error) {
    console.error('Stop roast error:', error);
    return res.status(500).json({ error: 'Failed to stop roast' });
  }
};

export const recordDataPoint = async (req, res) => {
  const { id } = req.params;
  const dataPoint = req.body;

  if (!dataPoint.elapsed_seconds) {
    return res.status(400).json({ error: 'Elapsed seconds required' });
  }

  try {
    const roast = await db('roasts')
      .where('id', id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!roast) {
      return res.status(404).json({ error: 'Roast not found' });
    }

    const logId = uuidv4();

    await db('temperature_logs').insert({
      id: logId,
      roast_id: id,
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

    const log = await db('temperature_logs').where('id', logId).first();

    return res.status(201).json(log);
  } catch (error) {
    console.error('Record data point error:', error);
    return res.status(500).json({ error: 'Failed to record data' });
  }
};

export const recordEvent = async (req, res) => {
  const { id } = req.params;
  const { event_type, elapsed_seconds, temperature, description, auto_detected } = req.body;

  if (!event_type) {
    return res.status(400).json({ error: 'Event type required' });
  }

  try {
    const roast = await db('roasts')
      .where('id', id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!roast) {
      return res.status(404).json({ error: 'Roast not found' });
    }

    const eventId = uuidv4();

    await db('roast_events').insert({
      id: eventId,
      roast_id: id,
      event_type,
      elapsed_seconds,
      temperature,
      description,
      auto_detected: auto_detected || false
    });

    if (event_type === 'first_crack' && !roast.first_crack_time) {
      await db('roasts')
        .where('id', id)
        .update({ first_crack_time: new Date() });
    }

    if (event_type === 'drop' && !roast.drop_time) {
      await db('roasts')
        .where('id', id)
        .update({ drop_time: new Date() });
    }

    const event = await db('roast_events').where('id', eventId).first();

    return res.status(201).json(event);
  } catch (error) {
    console.error('Record event error:', error);
    return res.status(500).json({ error: 'Failed to record event' });
  }
};

export const analyzeRoast = async (req, res) => {
  const { id } = req.params;

  try {
    const roast = await db('roasts')
      .where('id', id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!roast) {
      return res.status(404).json({ error: 'Roast not found' });
    }

    const logs = await db('temperature_logs')
      .where('roast_id', id)
      .orderBy('elapsed_seconds', 'asc');

    const events = await db('roast_events')
      .where('roast_id', id);

    const anomalies = await db('anomaly_logs')
      .where('roast_id', id);

    if (logs.length === 0) {
      return res.status(400).json({ error: 'No roast data available' });
    }

    const analysis = await analyzeRoastPost(
      {
        ...roast,
        roast_events: events,
        anomalies: anomalies,
        cupping_notes: null
      },
      null
    );

    const analysisId = uuidv4();

    await db('ai_analyses').insert({
      id: analysisId,
      roast_id: id,
      analysis_type: 'post_roast',
      content: JSON.stringify(analysis),
      recommendations: JSON.stringify(analysis.next_roast_guidance)
    });

    return res.status(201).json(analysis);
  } catch (error) {
    console.error('Analyze roast error:', error);
    return res.status(500).json({ error: 'Failed to analyze roast' });
  }
};

export const updateRoast = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const roast = await db('roasts')
      .where('id', id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!roast) {
      return res.status(404).json({ error: 'Roast not found' });
    }

    await db('roasts')
      .where('id', id)
      .update(updates);

    const updated = await db('roasts').where('id', id).first();

    return res.json(updated);
  } catch (error) {
    console.error('Update roast error:', error);
    return res.status(500).json({ error: 'Failed to update roast' });
  }
};

export const deleteRoast = async (req, res) => {
  const { id } = req.params;

  try {
    const roast = await db('roasts')
      .where('id', id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!roast) {
      return res.status(404).json({ error: 'Roast not found' });
    }

    await db('temperature_logs').where('roast_id', id).delete();
    await db('roast_events').where('roast_id', id).delete();
    await db('anomaly_logs').where('roast_id', id).delete();
    await db('ai_analyses').where('roast_id', id).delete();
    await db('cupping_notes').where('roast_id', id).delete();
    await db('roasts').where('id', id).delete();

    return res.json({ message: 'Roast deleted' });
  } catch (error) {
    console.error('Delete roast error:', error);
    return res.status(500).json({ error: 'Failed to delete roast' });
  }
};
