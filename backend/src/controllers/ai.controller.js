import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import {
  generateRoastProfile,
  analyzeRoastRealTime,
  analyzeRoastPost,
  comparativeAnalysis
} from '../services/ai.service.js';

export const analyzeRoast = async (req, res) => {
  const { roast_id } = req.body;

  if (!roast_id) {
    return res.status(400).json({ error: 'Roast ID required' });
  }

  try {
    const roast = await db('roasts')
      .where('id', roast_id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!roast) {
      return res.status(404).json({ error: 'Roast not found' });
    }

    const logs = await db('temperature_logs')
      .where('roast_id', roast_id)
      .orderBy('elapsed_seconds', 'asc');

    if (logs.length === 0) {
      return res.status(400).json({
        error: 'No temperature data available for analysis'
      });
    }

    const events = await db('roast_events').where('roast_id', roast_id);
    const anomalies = await db('anomaly_logs').where('roast_id', roast_id);

    const analysis = await analyzeRoastPost(
      {
        ...roast,
        roast_events: events,
        anomalies: anomalies
      },
      null
    );

    const analysisId = uuidv4();

    await db('ai_analyses').insert({
      id: analysisId,
      roast_id: roast_id,
      analysis_type: 'post_roast',
      content: JSON.stringify(analysis),
      recommendations: JSON.stringify(analysis.next_roast_guidance || {})
    });

    return res.status(201).json(analysis);
  } catch (error) {
    console.error('AI analysis error:', error);
    return res.status(500).json({ error: 'Failed to analyze roast' });
  }
};

export const generateProfile = async (req, res) => {
  const { green_coffee_id, target_flavor } = req.body;

  if (!green_coffee_id) {
    return res.status(400).json({ error: 'Green coffee ID required' });
  }

  try {
    const coffee = await db('green_coffees')
      .where('id', green_coffee_id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!coffee) {
      return res.status(404).json({ error: 'Coffee not found' });
    }

    const aiProfile = await generateRoastProfile(coffee, target_flavor);

    if (aiProfile.error) {
      return res.status(500).json({ error: aiProfile.error });
    }

    const profileId = uuidv4();

    await db('roast_profiles').insert({
      id: profileId,
      user_id: req.user.id,
      name: `${coffee.name} - ${target_flavor || 'Custom'}`,
      coffee_type: `${coffee.origin_country} - ${coffee.variety}`,
      target_flavor: target_flavor || 'Balanced',
      charge_temp: aiProfile.charge_temp,
      phases: JSON.stringify(aiProfile.phases),
      total_duration_target: aiProfile.total_duration_target,
      development_time_pct: aiProfile.development_time_pct,
      ai_generated: true,
      ai_reasoning: aiProfile.reasoning
    });

    const profile = await db('roast_profiles').where('id', profileId).first();

    return res.status(201).json({
      ...profile,
      phases: JSON.parse(profile.phases)
    });
  } catch (error) {
    console.error('AI profile generation error:', error);
    return res.status(500).json({ error: 'Failed to generate profile' });
  }
};

export const checkRealTime = async (req, res) => {
  const { roast_id, current_data, profile_target } = req.body;

  if (!roast_id || !current_data) {
    return res.status(400).json({
      error: 'Roast ID and current data required'
    });
  }

  try {
    const roast = await db('roasts')
      .where('id', roast_id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!roast) {
      return res.status(404).json({ error: 'Roast not found' });
    }

    const analysis = await analyzeRoastRealTime(current_data, profile_target || {});

    if (analysis.is_anomaly) {
      const anomalyId = uuidv4();

      await db('anomaly_logs').insert({
        id: anomalyId,
        roast_id: roast_id,
        elapsed_seconds: current_data.elapsed_seconds,
        anomaly_type: analysis.anomaly_type,
        severity: analysis.severity,
        description: analysis.description,
        suggested_action: analysis.immediate_action,
        ai_generated: true,
        resolved: false
      });
    }

    return res.json(analysis);
  } catch (error) {
    console.error('Real-time analysis error:', error);
    return res.status(500).json({ error: 'Analysis failed' });
  }
};

export const compareRoasts = async (req, res) => {
  const { roast_ids } = req.body;

  if (!roast_ids || roast_ids.length < 2) {
    return res.status(400).json({
      error: 'At least 2 roast IDs required for comparison'
    });
  }

  try {
    const roasts = await db('roasts')
      .select('*')
      .whereIn('id', roast_ids)
      .andWhere('user_id', req.user.id);

    if (roasts.length < 2) {
      return res.status(400).json({
        error: 'Not all roasts found or accessible'
      });
    }

    const analysis = await comparativeAnalysis(roasts);

    return res.json(analysis);
  } catch (error) {
    console.error('Comparative analysis error:', error);
    return res.status(500).json({ error: 'Comparison failed' });
  }
};
