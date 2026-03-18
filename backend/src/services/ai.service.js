import Anthropic from '@anthropic-ai/sdk';
import db from '../config/database.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';

/**
 * AI DECISION ENGINE - THE BRAIN OF ROASTMASTER
 *
 * This service provides world-class specialty coffee roasting guidance using Claude.
 * Acts as a master roaster with 25+ years of experience and deep coffee science expertise.
 */

// ============================================================================
// PHASE 1: PROFILE GENERATION
// ============================================================================

/**
 * Generates optimal roast profile for a specific green coffee and flavor target.
 * This is called before roasting begins.
 *
 * @param {Object} coffeeData - Green coffee characteristics
 * @param {Object} flavorTarget - Desired flavor profile
 * @param {Object} batchParams - Batch-specific parameters (optional)
 * @returns {Promise<Object>} - Complete roast profile with phases
 */
export const generateRoastProfile = async (coffeeData, flavorTarget = {}, batchParams = {}) => {
  const systemPrompt = `You are an elite specialty coffee roast profile designer with 25+ years of experience roasting micro-lot coffees. You have deep expertise in:

- Maillard reaction kinetics and caramelization chemistry
- Rate of Rise (RoR) curve design for different flavor outcomes
- The relationship between green coffee characteristics (density, moisture, altitude, processing) and optimal roast parameters
- ROEST L200 Ultra sample roaster behavior (convection-dominant, 1.65kW, 50-200g capacity)
- Development time ratios and their impact on sweetness, acidity, and body
- First crack timing and energy management post-crack
- Yellowing transition and initial Maillard phase optimization

KEY SCIENTIFIC PRINCIPLES:
- Higher altitude + higher density = needs more initial energy (higher charge temp, more power in drying phase)
- Washed coffees: emphasize acidity → faster development, lighter roast, higher RoR through Maillard phase
- Natural/pulped natural coffees: already sweet → lower initial power, gentler curve to avoid scorching sugars
- Anaerobic/carbonic coffees: very delicate → lowest power approach, extended Maillard phase with low RoR
- Light roast profile: 15-20% development ratio, drop at 200-208°C BT
- Medium roast profile: 20-25% development ratio, drop at 210-218°C BT
- Dark roast profile: 25-30% development ratio, drop at 220-230°C BT
- For fruity/floral: maintain high RoR through drying, sharp decline after FC (creates complexity)
- For chocolate/nutty: more gradual RoR decline, extended development (mellows and rounds)
- For balanced: moderate RoR curve, steady development ratio

ROEST L200 SPECIFICS:
- Charge temps typically 185-220°C depending on bean characteristics
- Convection-dominant = power and airflow work together; higher airflow requires lower power
- Optimal working range: power 30-85%, airflow 40-90%, RPM 15-40
- RoR naturally declines throughout roast due to decreasing delta-T between heat source and beans`;

  const userPrompt = `Generate a precise roast profile for this coffee:

GREEN COFFEE PROFILE:
- Origin: ${coffeeData.origin_country || 'Unknown'}, ${coffeeData.region || 'Unknown'}
- Farm: ${coffeeData.farm || 'Unknown'}
- Variety: ${coffeeData.variety || 'Unknown'}
- Processing: ${coffeeData.processing_method || 'Unknown'}
- Altitude: ${coffeeData.altitude || 'Unknown'}m
- Moisture Content: ${coffeeData.moisture_content || 'Unknown'}%
- Density: ${coffeeData.density || 'Unknown'}/10 (Higher = denser, needs more heat)
- Screen Size: ${coffeeData.screen_size || 'Unknown'}
- Green Color: ${coffeeData.green_color || 'Unknown'}
- Flavor Notes on Green: ${coffeeData.flavor_notes || 'To be discovered'}

TARGET FLAVOR PROFILE:
- Primary Target: ${flavorTarget.primary || 'Balanced'}
- Acidity Level: ${flavorTarget.acidity || 'Medium'} (Light/Medium/Dark)
- Body Target: ${flavorTarget.body || 'Medium'} (Light/Medium/Full)
- Sweetness: ${flavorTarget.sweetness ? 'Emphasized' : 'Normal'}
- Desired Flavor Notes: ${flavorTarget.notes?.join(', ') || 'To be optimized'}

BATCH PARAMETERS:
- Batch Size: ${batchParams.batch_weight_g || 100}g
- Roaster: ROEST L200 Ultra
- Ambient Conditions: ${batchParams.ambient_temp || 'Room temp'} ambient

Respond ONLY with valid JSON in this exact structure:
{
  "profile_name": "descriptive name for this profile",
  "description": "1-2 sentence summary of the approach and expected outcome",
  "total_estimated_time_seconds": number,
  "charge_temperature_celsius": number,
  "phases": [
    {
      "name": "Phase name (Drying/Yellowing/Browning/First Crack/Development)",
      "duration_seconds": number,
      "start_temp_celsius": number,
      "end_temp_celsius": number,
      "power_percent": number,
      "airflow_percent": number,
      "rpm_percent": number,
      "target_ror": number,
      "description": "what to watch for and why"
    }
  ],
  "key_targets": {
    "yellowing_temp": number,
    "first_crack_temp": number,
    "drop_temp": number,
    "development_ratio_percent": number,
    "total_development_time_seconds": number
  },
  "rationale": "detailed explanation of why these parameters suit this specific coffee",
  "watchpoints": ["observable marker 1", "observable marker 2"],
  "anomaly_triggers": ["problem condition 1", "problem condition 2"]
}`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      ...parsed
    };
  } catch (error) {
    console.error('Profile generation error:', error);
    throw new Error(`Failed to generate roast profile: ${error.message}`);
  }
};

// ============================================================================
// PHASE 2: REAL-TIME MONITORING & ANALYSIS
// ============================================================================

/**
 * Real-time roast analysis called every 10 seconds during roasting.
 * MUST be fast and provide actionable recommendations.
 *
 * @param {Object} currentData - Current sensor readings
 * @param {Object} profileTarget - Target profile for comparison
 * @param {Array} roastHistory - Last 5 roasts of same coffee
 * @returns {Promise<Object>} - Status, adjustments, predictions
 */
export const analyzeRoastRealtime = async (currentData, profileTarget, roastHistory = []) => {
  const systemPrompt = `You are an elite AI roast copilot monitoring a live coffee roast on a ROEST L200 Ultra. You monitor every 10 seconds of the roast and provide real-time guidance.

YOUR ROLE:
1. Compare current readings against the target profile
2. Detect anomalies (RoR crash, stalling, flicking, scorching risk, baking risk)
3. Recommend SPECIFIC, IMMEDIATE control adjustments
4. Predict what will happen in the next 30-60 seconds

CRITICAL REAL-TIME RULES:
- RoR should generally be declining throughout the roast (normal: starts 10-15°C/min, ends 2-4°C/min)
- RoR CRASH: sudden drop >3°C/min between readings = IMMEDIATE warning, suggest power +5-10%
- RoR FLICK: sudden spike after decline = warning, instability likely due to airflow turbulence
- BT STALLING: RoR < 2°C/min before FC = CRITICAL risk of baking, suggest power increase or airflow reduction
- OVER-TEMPERATURE: BT > target + 3°C = reduce power by 5-10%
- UNDER-TEMPERATURE: BT < target - 3°C = increase power by 5-10%
- FC PREDICTION: Monitor for acoustic indicators and BT trajectory
- POST-FC: Watch for post-crack RoR; typical is 50-60% of pre-crack RoR
- OVER-DEVELOPMENT: dev ratio > 25% = bitter risk, prepare for early drop
- WEIGHT LOSS CONCERN: >15% = drying out, <10% = underdeveloped

RESPONSE FORMAT: Always respond with valid JSON, never text.`;

  const userPrompt = `Analyze this roast checkpoint:

CURRENT STATUS (${currentData.elapsed_seconds}s into roast):
- Bean Temp (avg): ${currentData.bean_temp_1 || 0}°C
- Air Temp: ${currentData.air_temp || 0}°C
- RoR (last 10s): ${currentData.ror_bt || 0}°C/min
- Drum Pressure: ${currentData.drum_pressure || 0} bar
- Power/Airflow/RPM: ${currentData.power_pct || 0}% / ${currentData.airflow_pct || 0}% / ${currentData.rpm || 0}
- Current Phase: ${currentData.phase || 'Unknown'}

RECENT HISTORY (last 5 readings):
${currentData.recent_history ? currentData.recent_history.map((r, i) =>
  `T${i}: BT=${r.bean_temp}°C, RoR=${r.ror}°C/min, Power=${r.power}%`
).join('\n') : 'No history'}

TARGET PROFILE:
- Expected Temp: ${profileTarget?.target_temp || 0}°C
- Expected RoR: ${profileTarget?.target_ror || 0}°C/min
- Phase: ${profileTarget?.phase_name || 'Unknown'}

${roastHistory.length > 0 ? `HISTORICAL COMPARISON (same coffee, last 5 roasts):
${roastHistory.map(r => `- Drop at ${r.drop_temp}°C after ${r.dev_time_sec}s dev (${r.dev_pct}% dev ratio)`).join('\n')}` : ''}

Respond with this JSON structure ONLY:
{
  "status": "on_track" | "attention" | "warning" | "critical",
  "message": "brief, actionable message for the roaster",
  "adjustments": [
    {
      "parameter": "power" | "airflow" | "rpm",
      "current_value": number,
      "recommended_value": number,
      "change_percent": number,
      "reason": "why this adjustment",
      "urgency": "immediate" | "soon" | "optional"
    }
  ],
  "predictions": {
    "estimated_fc_time": "mm:ss or null",
    "estimated_drop_time": "mm:ss or null",
    "estimated_final_dev_ratio": number,
    "trajectory": "where the roast is heading"
  },
  "warnings": ["any critical issue"],
  "confidence": 0-1
}`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Real-time analysis error:', error);
    return {
      status: 'warning',
      message: 'AI analysis unavailable, using rule-based checks',
      error: true,
      confidence: 0
    };
  }
};

// ============================================================================
// PHASE 3: POST-ROAST ANALYSIS
// ============================================================================

/**
 * Comprehensive analysis after roast completes.
 * Evaluates the entire roast curve and provides learning insights.
 *
 * @param {Object} roastData - Complete roast log
 * @param {Object} profileTarget - Original target profile
 * @param {Object} cuppingNotes - Optional cupping evaluation
 * @returns {Promise<Object>} - Detailed analysis and next roast recommendations
 */
export const postRoastAnalysis = async (roastData, profileTarget, cuppingNotes = null) => {
  const systemPrompt = `You are a world-class coffee roasting analyst. You analyze completed roast data and provide:
1. Profile adherence evaluation
2. Phase-by-phase analysis
3. RoR curve quality assessment
4. Development time evaluation
5. Specific recommendations for next roast
6. Quality prediction based on roast parameters
7. Correlation with cupping notes (if provided)

Coffee Science Expertise:
- Light roasts: high acidity, complex florals/fruits, thin body, underdeveloped sweetness
- Medium roasts: balanced acidity, caramel sweetness, smooth body, developed complexity
- Dark roasts: low acidity, chocolate/nuts, full body, mellow flavor, risk of overroast
- Maillard reaction: 140-170°C, critical for sweetness and flavor complexity
- Caramelization: 170-200°C, adds body and browning
- Development: post-FC, locks in flavors, continues caramelization`;

  const userPrompt = `Analyze this completed roast:

ROAST EXECUTION:
- Coffee: ${roastData.coffee_name || 'Unknown'} from ${roastData.origin || 'Unknown'}
- Batch: ${roastData.batch_weight_g}g
- Total Time: ${roastData.total_duration_seconds}s (${(roastData.total_duration_seconds/60).toFixed(1)}m)
- Charge Temp: ${roastData.charge_temp}°C

ROAST CURVE:
- Drying to Yellowing: ${roastData.drying_duration_seconds}s
- Maillard Phase: ${roastData.maillard_duration_seconds}s
- First Crack: ${roastData.first_crack_seconds}s at ${roastData.first_crack_temp}°C
- Development Time: ${roastData.development_seconds}s (${roastData.dev_ratio_percent}%)
- Drop Temp: ${roastData.drop_temp}°C
- Color: ${roastData.final_color}
- Weight Loss: ${roastData.weight_loss_percent}%

ROAST METRICS:
- Avg RoR: ${roastData.avg_ror}°C/min
- Peak RoR: ${roastData.peak_ror}°C/min
- Min RoR: ${roastData.min_ror}°C/min

${roastData.anomalies && roastData.anomalies.length > 0 ? `ANOMALIES DETECTED:
${roastData.anomalies.map(a => `- [${a.severity}] ${a.type}: ${a.description}`).join('\n')}` : 'No anomalies detected'}

${profileTarget ? `TARGET PROFILE COMPARISON:
- Target Dev %: ${profileTarget.key_targets?.development_ratio_percent}%
- Target Drop: ${profileTarget.key_targets?.drop_temp}°C
- Target FC Temp: ${profileTarget.key_targets?.first_crack_temp}°C` : ''}

${cuppingNotes ? `CUPPING NOTES:
${cuppingNotes.notes || 'N/A'}
- Overall Score: ${cuppingNotes.overall_score}/100
- Flavor Match: ${cuppingNotes.flavor_match ? 'Yes' : 'No'}` : ''}

Respond with this JSON structure:
{
  "overall_assessment": "summary: excellent/good/fair/poor and why",
  "roast_success_score": 0-100,
  "maillard_phase": {
    "assessment": "adequate/rushed/extended",
    "indicators": "supporting observations",
    "impact": "effect on final cup"
  },
  "first_crack": {
    "timing": "early/on_time/late relative to typical",
    "quality": "smooth/explosive/problematic",
    "energy_management": "notes on power/airflow around FC"
  },
  "development_phase": {
    "duration_adequacy": "percentage vs typical for this coffee",
    "ror_curve": "description of RoR decline",
    "quality": "optimal/slightly_short/over_developed"
  },
  "flavor_trajectory": {
    "predicted_flavor_profile": "based on roast parameters",
    "likely_characteristics": ["flavor1", "flavor2"],
    "confidence": 0-1
  },
  "roasting_technique": {
    "strengths": ["what was done well"],
    "improvements": ["what could be better"],
    "specific_next_roast_changes": "actionable recommendations"
  },
  "anomalies_impact": "how anomalies affected roast quality",
  "next_roast_guidance": {
    "charge_temp_adjustment": "±°C or 'no change'",
    "development_time_adjustment": "±seconds or % or 'no change'",
    "power_profile_adjustment": "changes to power curve",
    "rationale": "why these adjustments",
    "expected_improvement": "what will improve"
  },
  "learning_insights": ["key lesson 1", "key lesson 2"]
}`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Post-roast analysis error:', error);
    throw new Error(`Failed to analyze roast: ${error.message}`);
  }
};

// ============================================================================
// PHASE 4: COMPARATIVE INSIGHTS
// ============================================================================

/**
 * Big data analysis across multiple roasts to identify patterns and optimization paths.
 *
 * @param {Array} allRoasts - Array of roast objects
 * @param {Object} filters - Optional filters (origin, variety, date range, etc)
 * @returns {Promise<Object>} - Patterns, insights, optimization recommendations
 */
export const bigDataInsights = async (allRoasts, filters = {}) => {
  if (!allRoasts || allRoasts.length < 3) {
    return {
      error: 'Need at least 3 roasts for pattern analysis',
      count: allRoasts?.length || 0
    };
  }

  const systemPrompt = `You are a coffee roasting data scientist. You analyze roast data to identify patterns, optimization opportunities, and actionable insights. You understand:

- Statistical significance in small datasets
- Roast parameter correlation with quality outcomes
- Development time and temperature optimization for different coffees
- Seasonal or batch-size effects
- Skill development progression
- Equipment performance consistency`;

  const roastSummaries = allRoasts.slice(-20).map((r, i) => `
ROAST ${i + 1}:
- Date: ${r.created_at}
- Coffee: ${r.coffee_name} from ${r.origin}
- Batch: ${r.batch_weight_g}g
- Total Time: ${r.total_duration_seconds}s
- Charge→Drop: ${r.charge_temp}°C → ${r.drop_temp}°C
- Dev Time: ${r.development_seconds}s (${r.dev_ratio_percent}%)
- RoR Profile: avg ${r.avg_ror}°C/min, peak ${r.peak_ror}°C/min
- Weight Loss: ${r.weight_loss_percent}%
- Quality Score: ${r.quality_rating || 'Not rated'}/100
- Notes: ${r.cupping_notes ? 'Cupped' : 'Not cupped'}`).join('\n');

  const userPrompt = `Analyze patterns across these ${allRoasts.length} roasts:

${roastSummaries}

${filters.origin ? `Filter: Origin = ${filters.origin}` : ''}
${filters.coffee_name ? `Filter: Coffee = ${filters.coffee_name}` : ''}

Identify:
1. Consistency patterns (are results repeatable?)
2. Performance trends (improving or declining?)
3. Optimal parameter ranges for this coffee
4. Anomalies or outliers
5. Roaster skill development
6. Next optimization targets

Respond with JSON:
{
  "roast_count_analyzed": number,
  "consistency_score": 0-100,
  "improvement_trend": "improving" | "stable" | "declining",
  "key_patterns": ["pattern1", "pattern2", "pattern3"],
  "optimal_parameters": {
    "ideal_charge_temp": number,
    "ideal_development_percent": number,
    "ideal_drop_temp": number,
    "confidence": 0-1
  },
  "performance_distribution": {
    "excellent_percent": number,
    "good_percent": number,
    "fair_percent": number,
    "poor_percent": number
  },
  "outliers": [
    {
      "roast_id": "identifier",
      "reason": "why this roast stands out"
    }
  ],
  "skill_assessment": "novice/intermediate/advanced/expert",
  "skill_development": "static/improving/rapidly_improving",
  "optimization_recommendations": [
    {
      "target": "what to optimize",
      "current_state": "what's happening now",
      "recommendation": "specific change to make",
      "expected_impact": "what will improve"
    }
  ],
  "next_roasts_focus": "what to focus on for next 5 roasts"
}`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Big data insights error:', error);
    throw new Error(`Failed to generate insights: ${error.message}`);
  }
};

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

/**
 * Backward compatibility wrapper for old function names
 */
export const analyzeRoastRealTime = async (currentData, profileTarget) => {
  return analyzeRoastRealtime(currentData, profileTarget, []);
};

export const analyzeRoastPost = async (roastData, profileTarget) => {
  return postRoastAnalysis(roastData, profileTarget, null);
};

export const comparativeAnalysis = async (roasts) => {
  return bigDataInsights(roasts, {});
};
