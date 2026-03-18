import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import {
  generateRoastProfile,
  analyzeRoastRealtime,
  postRoastAnalysis,
  bigDataInsights
} from '../services/ai.service.js';

/**
 * AI CONTROLLER
 *
 * REST endpoints for AI Decision Engine:
 * - Profile generation
 * - Real-time analysis
 * - Post-roast analysis
 * - Comparative insights
 */

/**
 * POST /api/ai/generate-profile
 * Generate an optimal roast profile for a green coffee
 */
export const generateProfile = async (req, res) => {
  const { green_coffee_id, target_flavor, batch_weight_g, ambient_conditions } = req.body;

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

    // Build flavor target object
    const flavorTarget = target_flavor ? {
      primary: typeof target_flavor === 'string' ? target_flavor : target_flavor.primary,
      acidity: target_flavor?.acidity || 'Medium',
      body: target_flavor?.body || 'Medium',
      sweetness: target_flavor?.sweetness || false,
      notes: target_flavor?.notes || []
    } : undefined;

    // Build batch parameters
    const batchParams = {
      batch_weight_g: batch_weight_g || 100,
      ambient_temp: ambient_conditions?.temperature || 'Room temperature'
    };

    // Call AI service
    const aiProfile = await generateRoastProfile(coffee, flavorTarget, batchParams);

    if (aiProfile.error) {
      return res.status(500).json({
        error: aiProfile.error,
        message: 'Failed to generate profile'
      });
    }

    const profileId = uuidv4();

    // Save profile to database
    await db('roast_profiles').insert({
      id: profileId,
      user_id: req.user.id,
      name: aiProfile.profile_name,
      coffee_type: `${coffee.origin_country} - ${coffee.variety}`,
      target_flavor: target_flavor?.primary || 'Balanced',
      charge_temp: aiProfile.charge_temperature_celsius,
      phases: JSON.stringify(aiProfile.phases),
      total_duration_target: aiProfile.total_estimated_time_seconds,
      development_time_pct: aiProfile.key_targets?.development_ratio_percent,
      ai_generated: true,
      ai_reasoning: aiProfile.rationale,
      created_at: new Date()
    });

    const profile = await db('roast_profiles').where('id', profileId).first();

    return res.status(201).json({
      success: true,
      profile_id: profileId,
      profile_name: aiProfile.profile_name,
      description: aiProfile.description,
      charge_temperature: aiProfile.charge_temperature_celsius,
      total_estimated_time: aiProfile.total_estimated_time_seconds,
      phases: aiProfile.phases,
      key_targets: aiProfile.key_targets,
      watchpoints: aiProfile.watchpoints,
      anomaly_triggers: aiProfile.anomaly_triggers
    });
  } catch (error) {
    console.error('Profile generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate profile',
      message: error.message
    });
  }
};

/**
 * POST /api/ai/realtime-check
 * Real-time roast monitoring analysis (called every 10 seconds during roast)
 */
export const checkRealtime = async (req, res) => {
  const { roast_id, current_data, profile_target, roast_history } = req.body;

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

    // Get recent roasts of same coffee for historical comparison
    let history = roast_history || [];
    if (!history.length && roast.green_coffee_id) {
      const recentRoasts = await db('roasts')
        .where('green_coffee_id', roast.green_coffee_id)
        .andWhere('user_id', req.user.id)
        .whereNot('id', roast_id)
        .orderBy('created_at', 'desc')
        .limit(5);
      history = recentRoasts;
    }

    // Call AI service
    const analysis = await analyzeRoastRealtime(current_data, profile_target, history);

    return res.json(analysis);
  } catch (error) {
    console.error('Real-time analysis error:', error);
    return res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
};

/**
 * POST /api/ai/analyze-roast
 * Post-roast comprehensive analysis
 */
export const analyzeRoast = async (req, res) => {
  const { roast_id, cupping_notes } = req.body;

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

    // Get roast data
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

    // Build comprehensive roast data
    const roastData = {
      coffee_name: roast.coffee_name,
      origin: roast.origin,
      batch_weight_g: roast.batch_weight_g,
      total_duration_seconds: roast.total_duration_seconds,
      charge_temp: roast.charge_temp,
      first_crack_seconds: roast.first_crack_time,
      first_crack_temp: roast.first_crack_temp,
      development_seconds: roast.development_time,
      dev_ratio_percent: roast.development_pct,
      drop_temp: roast.drop_temp,
      drop_time: roast.total_duration_seconds, // Last recorded time
      final_color: roast.final_color,
      weight_loss_percent: roast.weight_loss_pct,
      avg_ror: roast.avg_ror,
      peak_ror: roast.peak_ror,
      min_ror: roast.min_ror,
      anomalies: anomalies.map(a => ({
        type: a.anomaly_type,
        severity: a.severity,
        description: a.description
      })),
      roast_events: events.map(e => ({
        type: e.event_type,
        temp: e.temperature,
        time: e.elapsed_seconds,
        description: e.description
      })),
      // Add derived metrics
      drying_duration_seconds: events.find(e => e.event_type === 'yellowing')?.elapsed_seconds || 0,
      maillard_duration_seconds: (events.find(e => e.event_type === 'first_crack')?.elapsed_seconds || 0)
        - (events.find(e => e.event_type === 'yellowing')?.elapsed_seconds || 0)
    };

    // Get profile target if exists
    const profileTarget = roast.profile_id
      ? await db('roast_profiles').where('id', roast.profile_id).first()
      : null;

    const profileData = profileTarget && profileTarget.phases
      ? {
          key_targets: {
            development_ratio_percent: profileTarget.development_time_pct,
            drop_temp: profileTarget.drop_temp,
            first_crack_temp: profileTarget.first_crack_temp,
            total_development_time_seconds: (profileTarget.development_time_pct / 100) * roastData.total_duration_seconds
          }
        }
      : null;

    // Call AI service
    const analysis = await postRoastAnalysis(roastData, profileData, cupping_notes);

    const analysisId = uuidv4();

    // Save analysis to database
    await db('ai_analyses').insert({
      id: analysisId,
      roast_id: roast_id,
      analysis_type: 'post_roast',
      content: JSON.stringify(analysis),
      recommendations: JSON.stringify(analysis.next_roast_guidance || {}),
      created_at: new Date()
    });

    return res.status(201).json({
      success: true,
      analysis_id: analysisId,
      ...analysis
    });
  } catch (error) {
    console.error('Post-roast analysis error:', error);
    return res.status(500).json({
      error: 'Failed to analyze roast',
      message: error.message
    });
  }
};

/**
 * POST /api/ai/insights
 * Big data insights across multiple roasts
 */
export const getInsights = async (req, res) => {
  const { coffee_id, origin, variety, limit } = req.body;

  try {
    let query = db('roasts').where('user_id', req.user.id);

    if (coffee_id) {
      query = query.where('green_coffee_id', coffee_id);
    }
    if (origin) {
      query = query.where('origin', origin);
    }
    if (variety) {
      query = query.where('variety', variety);
    }

    const roasts = await query
      .orderBy('created_at', 'desc')
      .limit(limit || 50);

    if (roasts.length < 3) {
      return res.status(400).json({
        error: 'Insufficient roasts for analysis',
        minimum_required: 3,
        available: roasts.length
      });
    }

    // Enrich roast data
    const enrichedRoasts = roasts.map(r => ({
      created_at: r.created_at,
      coffee_name: r.coffee_name,
      origin: r.origin,
      batch_weight_g: r.batch_weight_g,
      total_duration_seconds: r.total_duration_seconds,
      charge_temp: r.charge_temp,
      drop_temp: r.drop_temp,
      first_crack_seconds: r.first_crack_time,
      first_crack_temp: r.first_crack_temp,
      development_seconds: r.development_time,
      dev_ratio_percent: r.development_pct,
      dev_time_sec: r.development_time,
      weight_loss_percent: r.weight_loss_pct,
      avg_ror: r.avg_ror,
      peak_ror: r.peak_ror,
      min_ror: r.min_ror,
      quality_rating: r.quality_rating
    }));

    // Call AI service
    const filters = { origin, coffee_name: coffee_id ? 'specific' : undefined };
    const insights = await bigDataInsights(enrichedRoasts, filters);

    return res.json({
      success: true,
      roasts_analyzed: enrichedRoasts.length,
      ...insights
    });
  } catch (error) {
    console.error('Insights generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate insights',
      message: error.message
    });
  }
};

/**
 * POST /api/ai/compare-roasts
 * Compare multiple roasts side-by-side
 */
export const compareRoasts = async (req, res) => {
  const { roast_ids } = req.body;

  if (!roast_ids || roast_ids.length < 2) {
    return res.status(400).json({
      error: 'At least 2 roast IDs required for comparison',
      minimum: 2,
      provided: roast_ids?.length || 0
    });
  }

  try {
    const roasts = await db('roasts')
      .select('*')
      .whereIn('id', roast_ids)
      .andWhere('user_id', req.user.id);

    if (roasts.length < 2) {
      return res.status(400).json({
        error: 'Not all roasts found or accessible',
        requested: roast_ids.length,
        found: roasts.length
      });
    }

    // Call insights API with specific roasts
    const insights = await bigDataInsights(roasts, {});

    return res.json({
      success: true,
      comparison_count: roasts.length,
      ...insights
    });
  } catch (error) {
    console.error('Comparative analysis error:', error);
    return res.status(500).json({
      error: 'Comparison failed',
      message: error.message
    });
  }
};
