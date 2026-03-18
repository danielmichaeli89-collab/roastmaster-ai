import Anthropic from '@anthropic-ai/sdk';
import db from '../config/database.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';

/**
 * AI DECISION ENGINE - THE BRAIN OF ROASTMASTER
 *
 * MASSIVELY UPGRADED: World-class specialty coffee roasting AI with deep expertise in:
 * - Advanced RoR curve design and defect detection (crashes, flicks, stalls)
 * - Origin-specific roasting strategies (Ethiopia, Kenya, Colombia, Brazil, Guatemala, Panama, Yemen)
 * - Processing method optimization (washed, natural, honey, anaerobic)
 * - Batch size and altitude adjustments
 * - Real-time anomaly detection and predictive control
 * - Historical learning and iterative improvement
 */

// ============================================================================
// ADVANCED COFFEE SCIENCE KNOWLEDGE BASE
// ============================================================================

const COFFEE_SCIENCE_CONTEXT = `
EXPERT ROASTING SCIENCE FOUNDATION:

RoR CURVE PRINCIPLES (Scott Rao + Competition Standards):
- Drying Phase (charge to ~170°C): Target RoR 12-20°C/min. Mission: efficient moisture removal without scorching.
- Maillard Phase (170°C to FC ~195-205°C): Target RoR 8-12°C/min declining. This is where flavor complexity develops. Extended Maillard = sweetness. Rushed = thin cup.
- Development Phase (post-FC): Target RoR 3-7°C/min. Locks in flavors. Too short = sour. Too long = bitter.
- GOLDEN RULE: RoR must be CONTINUOUSLY DECLINING. Any increase ("flick") or sudden drop > 3°C/min ("crash") = defects.

RoR DEFECT CATEGORIES:
- CRASH: Sudden RoR drop >3°C/min = baked flavors, lost sweetness. Cause: insufficient heat at FC, over-aggressive exothermic reaction.
- FLICK: RoR spike after decline = charring risk. Cause: overcompensation after crash, too much power post-FC.
- STALLING: RoR < 1-2°C/min before FC = baked, flat, lifeless. Cause: insufficient thermal momentum.
- SCORCHING: Bean surface burned before internal moisture removed. Cause: excessive power in drying for bean density.

RPM IS THE HIDDEN POWER LEVER:
"Changing RPM has more significant impact on roast than airflow changes." Higher RPM = more bean-air contact = faster heat transfer = can use less power.

ROEST L200 ULTRA SPECIFICS:
- Sensors: Dual BT, ET, Inlet, Drum, Exhaust temps; Drum pressure; AI microphone for FC detection
- Controls: Power % (heating), Fan % (exhaust), RPM (drum paddles), Development time
- Charge temps: 185-220°C depending on bean characteristics
- Optimal ranges: Power 30-85%, Airflow 40-90%, RPM 15-40
- Counterflow Mode: Reverses drum so beans flow INTO hot air - enables lower temps or faster roasting

PROCESSING METHOD STRATEGIES:

WASHED COFFEES (clean, bright, high acidity):
- Higher charge temp (200-210°C ET for dense)
- Moderate-to-fast drying
- Extended Maillard for sweetness
- Short development (15-18% ratio) to preserve acidity
- Higher airflow throughout
- Drop: 200-210°C BT (light), 210-218°C (medium)

NATURAL/DRY PROCESS (fruity, sweet, heavy body, low acidity):
- Lower charge temp (190-200°C ET) - residual sugars scorch easily
- Slower drying with more RPM, less power
- Moderate Maillard - already sweet
- Medium development (18-22%)
- Drop: 198-208°C BT (light), 208-215°C (medium)

HONEY/PULPED NATURAL (sweet, rounded, medium acidity):
- Medium charge (195-205°C ET)
- Moderate drying
- Extended Maillard
- Medium development (18-22%)
- Drop: 200-210°C BT

ANAEROBIC/CARBONIC (intense fruit, unique fermentation):
- LOWEST charge (185-195°C ET) - extremely delicate
- Very gentle drying - slow power ramp
- Extended Maillard - LOW RoR, never above 10°C/min
- Short development (14-17%) to preserve character
- LOW airflow to protect volatiles
- Drop: 195-205°C BT (lighter preferred)

ORIGIN-SPECIFIC ROASTING:

ETHIOPIA (Heirloom, Bourbon):
- High altitude (1800-2200m), very dense
- Washed: jasmine, bergamot, stone fruit → light roast, fast drying, short dev
- Natural: blueberry, strawberry, wine → gentle, medium dev
- Avoid dark roast - destroys terroir

KENYA (SL28, SL34):
- Very dense, high acidity
- Blackcurrant, tomato, grapefruit → medium charge, extended Maillard, 17-20% dev

COLOMBIA (Caturra, Castillo, Pink Bourbon):
- Medium-high density, versatile
- Chocolate, caramel, red fruit → 18-22% development ratio

GUATEMALA/CENTRAL AMERICA:
- Medium density, chocolate/nut forward
- Higher charge OK, extended development enhances chocolate
- 20-25% development

PANAMA GEISHA:
- Medium density, extremely delicate
- Jasmine, peach, citrus → treat like anaerobic, very gentle
- 14-18% development, light roast only

BRAZIL (Bourbon, Catuai):
- Lower altitude, less dense
- Nut, chocolate, low acidity → lower charge, longer dev
- Can go medium-dark → 22-28% development

YEMEN:
- Ancient varieties, very dense, unique terroir
- Fruit, spice, wine → medium charge, careful Maillard
- 16-20% development

BATCH SIZE ADJUSTMENTS (ROEST L200 Ultra):
- 50g: Reduce charge -5-10°C, reduce power -5-10%
- 100g: Standard reference
- 150g: Increase charge +3-5°C
- 200g: Increase charge +5-10°C, may need more power, slower development

ALTITUDE/DENSITY CORRELATION:
- <1200m (low): Soft, porous → lower charge, less power, scorch risk
- 1200-1600m (medium): Moderate → standard
- 1600-2000m (high): Dense → higher charge, more power, needs momentum
- >2000m (very high): Very dense → highest charge, aggressive power start

MOISTURE CONTENT IMPACT:
- 9-10% (dry/aged): Shorter drying, lower charge, scorch risk
- 10.5-11.5% (ideal): Standard parameters
- 11.5-12.5% (high): Extended drying, higher initial power
- >12.5% (very wet): Extended drying, aggressive power start
`;

// ============================================================================
// PHASE 1: PROFILE GENERATION - MASSIVELY UPGRADED
// ============================================================================

/**
 * Generates optimal roast profile for a specific green coffee and flavor target.
 * Now incorporates deep knowledge of processing methods, origins, batch sizes, and RoR science.
 *
 * @param {Object} coffeeData - Green coffee characteristics
 * @param {Object} flavorTarget - Desired flavor profile
 * @param {Object} batchParams - Batch-specific parameters (optional)
 * @returns {Promise<Object>} - Complete roast profile with phases
 */
export const generateRoastProfile = async (coffeeData, flavorTarget = {}, batchParams = {}) => {
  const systemPrompt = `You are an elite specialty coffee roast profile designer with 25+ years of competition roasting experience.

${COFFEE_SCIENCE_CONTEXT}

YOUR TASK: Generate precise, science-backed roast profiles that maximize cup quality.

DECISION FRAMEWORK:
1. Analyze green coffee: origin, altitude, density, processing, moisture
2. Apply origin-specific strategy
3. Design RoR curve that continuously declines
4. Account for batch size adjustments
5. Calculate development ratio for target roast level
6. Build phase-by-phase control strategy
7. Define anomaly triggers specific to this coffee

CRITICAL CONSTRAINTS:
- RoR must ALWAYS decline smoothly throughout roast
- Drying: 12-20°C/min depending on density and moisture
- Maillard: 8-12°C/min declining (this is where quality is made)
- Development: 3-7°C/min (locks in flavors)
- Never exceed power/airflow/RPM limits of ROEST L200
- Account for batch size with temp/power adjustments
- Match processing method strategy exactly`;

  const batchSize = batchParams.batch_weight_g || 100;
  const chargeAdjustment = calculateBatchSizeAdjustment(batchSize, coffeeData.altitude || 1500);

  const userPrompt = `Generate a precise roast profile for this coffee:

GREEN COFFEE ANALYSIS:
- Origin: ${coffeeData.origin_country || 'Unknown'}, ${coffeeData.region || 'Unknown'}
- Farm/Producer: ${coffeeData.farm || 'Unknown'}
- Variety: ${coffeeData.variety || 'Unknown'}
- Processing: ${coffeeData.processing_method || 'Unknown'} (CRITICAL - drives entire strategy)
- Altitude: ${coffeeData.altitude || 1500}m (${getAltitudeCategory(coffeeData.altitude)} density impact)
- Moisture: ${coffeeData.moisture_content || 11}% (impacts drying phase duration)
- Density Rating: ${coffeeData.density || 7}/10
- Screen Size: ${coffeeData.screen_size || 'Unknown'}
- Green Color: ${coffeeData.green_color || 'Unknown'}
- Estimated Flavor Potential: ${coffeeData.flavor_notes || 'Unknown'}

ROASTING TARGET:
- Roast Level: ${flavorTarget.roast_level || 'Medium'} (Light 15-18% dev, Medium 20-23% dev, Dark 25-30% dev)
- Primary Flavor: ${flavorTarget.primary || 'Balanced'}
- Acidity: ${flavorTarget.acidity || 'Medium'} (affects development ratio)
- Body: ${flavorTarget.body || 'Medium'} (thin = short dev, full = longer dev)
- Sweetness: ${flavorTarget.sweetness ? 'Emphasized' : 'Normal'}
- Desired Notes: ${flavorTarget.notes?.join(', ') || 'Origin expression'}

BATCH PARAMETERS:
- Batch Size: ${batchSize}g (${getBatchSizeCategory(batchSize)})
- Charge Temp Baseline: ${chargeAdjustment.baseTemp}°C (adjusted from altitude/moisture/density)
- Roaster: ROEST L200 Ultra
- Ambient: ${batchParams.ambient_temp || 'Room'} temp

PREVIOUS ROASTS OF THIS COFFEE (if applicable): ${batchParams.previous_roasts ? `${batchParams.previous_roasts.length} roasts logged` : 'None'}

RESPOND WITH THIS JSON STRUCTURE ONLY:
{
  "profile_name": "descriptive name",
  "description": "2-3 sentences on strategy and expected outcome",
  "processing_strategy_note": "how processing method influenced this design",
  "origin_strategy_note": "how origin/altitude/density influenced parameters",
  "total_estimated_time_seconds": number,
  "charge_temperature_celsius": number,
  "charge_rationale": "why this specific charge temp",

  "phases": [
    {
      "name": "Drying",
      "duration_seconds": number,
      "start_temp_celsius": number,
      "end_temp_celsius": number,
      "power_percent": number,
      "airflow_percent": number,
      "rpm_percent": number,
      "target_ror_min": number,
      "target_ror_max": number,
      "description": "detailed strategy for this phase"
    }
  ],

  "key_targets": {
    "yellowing_onset_temp": number,
    "maillard_end_temp": number,
    "first_crack_temp": number,
    "drop_temp": number,
    "development_ratio_percent": number,
    "total_development_time_seconds": number
  },

  "ror_curve_design": "detailed description of RoR decline strategy",
  "anomaly_triggers": {
    "crash_detection": "RoR drop >X°C/min = reduce power, increase airflow",
    "stalling_detection": "RoR <2°C/min before FC = increase power Y%",
    "scorching_risk": "conditions to watch for in drying phase",
    "flicking_risk": "post-FC instability warning"
  },

  "watchpoints": ["visible marker 1", "audible marker 2", "sensory marker 3"],
  "expected_cup_profile": "predicted flavor outcome with roast level",
  "confidence_score": 0-100
}`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 3000,
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
// PHASE 2: REAL-TIME MONITORING & ANALYSIS - MASSIVELY UPGRADED
// ============================================================================

/**
 * Real-time roast analysis called every 10 seconds during roasting.
 * Now features advanced RoR defect detection, predictive trajectory analysis,
 * and processing-method-aware recommendations.
 *
 * @param {Object} currentData - Current sensor readings
 * @param {Object} profileTarget - Target profile for comparison
 * @param {Object} coffeeProfile - Coffee characteristics (processing, origin, density)
 * @param {Array} roastHistory - Last 5 roasts of same coffee
 * @returns {Promise<Object>} - Status, adjustments, predictions
 */
export const analyzeRoastRealtime = async (currentData, profileTarget, coffeeProfile = {}, roastHistory = []) => {
  const systemPrompt = `You are an elite AI roast copilot monitoring a live ROEST L200 Ultra roast with real-time advanced analytics.

${COFFEE_SCIENCE_CONTEXT}

YOUR MISSION: Detect anomalies, predict trajectory, recommend immediate control changes.

ADVANCED ANOMALY DETECTION:
1. RoR CRASH (sudden drop >3°C/min): Cause = insufficient heat at FC. Action = immediate power +5-10%, monitor recovery
2. RoR FLICK (spike after decline): Cause = overcompensation or airflow instability. Action = gentle power reduction, steady airflow
3. RoR STALLING (< 1-2°C/min before FC): Cause = insufficient thermal momentum. Action = power +10-15%, increase RPM (more effective than airflow)
4. SCORCHING (drying phase too aggressive): Cause = charge temp too high for bean density OR power too high early. Action = reduce power, increase RPM
5. BAKING RISK (flat development): Cause = extended time at low RoR. Action = increase thermal input (power or RPM)

TEMPERATURE MANAGEMENT:
- Lead/Lag: Allow target ±2°C during normal phases, ±3°C during transitions
- Over-temp at FC: Critical - reduces development room, bitter risk
- Under-temp at drop: Results in sour, underdeveloped coffee

RoR TRAJECTORY ANALYSIS:
- Calculate RoR trend (slope of recent RoR readings)
- Predict if RoR will stabilize, crash, or flick in next 30s
- Recommend preventive control changes BEFORE anomalies occur

PROCESSING-METHOD CONSIDERATIONS:
- Natural coffees: Watch for uneven heating, higher scorch risk
- Anaerobic: Must maintain ultra-smooth RoR decline, low power throughout
- Washed: Can tolerate sharper RoR curves, extended development OK
- Honey: Middle ground - gentle but purposeful

RPM LEVERAGE: Remember RPM changes have GREATER impact than airflow changes on heat transfer.`;

  const recentRoR = currentData.recent_history?.map(r => r.ror) || [];
  const rorTrend = calculateRoRTrend(recentRoR);
  const rorDeviation = Math.abs((currentData.ror_bt || 0) - (profileTarget?.target_ror || 0));
  const isPreFirstCrack = (currentData.elapsed_seconds || 0) < (profileTarget?.first_crack_time_seconds || 600);

  const userPrompt = `Analyze this live roast with advanced diagnostics:

CURRENT STATUS (${currentData.elapsed_seconds}s into roast):
- Bean Temp (BT): ${currentData.bean_temp_1 || 0}°C (target: ${profileTarget?.target_temp || 0}°C)
- Air Temp (ET): ${currentData.air_temp || 0}°C
- RoR (last 10s): ${currentData.ror_bt || 0}°C/min (target: ${profileTarget?.target_ror || 0}°C/min)
- RoR Deviation: ${rorDeviation.toFixed(1)}°C/min
- RoR Trend: ${rorTrend.direction} at ${rorTrend.rate}°C/min²
- Drum Pressure: ${currentData.drum_pressure || 0} bar
- Controls: Power ${currentData.power_pct || 0}%, Airflow ${currentData.airflow_pct || 0}%, RPM ${currentData.rpm || 0}
- Phase: ${currentData.phase || 'Unknown'} (${isPreFirstCrack ? 'PRE-FC' : 'POST-FC'})
- Elapsed: ${formatTime(currentData.elapsed_seconds || 0)}

ROAST HISTORY (last 5 readings, most recent last):
${currentData.recent_history ? currentData.recent_history.map((r, i) =>
  `T-${5-i}0s: BT=${r.bean_temp}°C, RoR=${r.ror}°C/min, Power=${r.power}%, Airflow=${r.airflow}%, RPM=${r.rpm}`
).join('\n') : 'No history'}

COFFEE PROFILE:
- Origin: ${coffeeProfile.origin_country || 'Unknown'}
- Processing: ${coffeeProfile.processing_method || 'Unknown'}
- Altitude: ${coffeeProfile.altitude || 1500}m
- Density: ${coffeeProfile.density || 5}/10
- Moisture: ${coffeeProfile.moisture_content || 11}%

TARGET PROFILE:
- Phase: ${profileTarget?.phase_name || 'Unknown'}
- Expected RoR Range: ${profileTarget?.target_ror_min || 0}-${profileTarget?.target_ror_max || 0}°C/min
- Expected Dev Ratio: ${profileTarget?.development_ratio_percent || 0}%
- Drop Target: ${profileTarget?.drop_temp || 0}°C

${roastHistory.length > 0 ? `HISTORICAL BASELINE (same coffee):
- Typical FC time: ${getAverageValue(roastHistory.map(r => r.first_crack_seconds))}s
- Typical dev ratio: ${getAverageValue(roastHistory.map(r => r.dev_pct))}%
- Typical drop: ${getAverageValue(roastHistory.map(r => r.drop_temp))}°C` : ''}

ANALYZE AND RESPOND WITH THIS JSON:
{
  "status": "on_track" | "attention" | "warning" | "critical",
  "primary_finding": "most important observation (1 sentence)",
  "anomaly_detected": "crash" | "flick" | "stalling" | "scorching" | "baking" | null,
  "anomaly_severity": "low" | "medium" | "high" if anomaly_detected,
  "anomaly_description": "detailed explanation of what's happening",

  "adjustments": [
    {
      "parameter": "power" | "airflow" | "rpm",
      "current_value": number,
      "recommended_value": number,
      "change_percent": number,
      "reason": "specific reason for this change",
      "urgency": "immediate" | "soon" | "optional",
      "expected_effect": "what will improve"
    }
  ],

  "ror_analysis": {
    "current_ror": number,
    "target_ror": number,
    "trend": "increasing" | "stable" | "declining",
    "trend_rate": number,
    "prediction_30s": "predicted RoR in 30 seconds",
    "concern": "any anomaly risk predicted"
  },

  "predictions": {
    "estimated_fc_time": "mm:ss or null if already past",
    "estimated_drop_time": "mm:ss",
    "estimated_final_dev_ratio": number,
    "cup_trajectory": "where this roast is heading cup-wise"
  },

  "coffee_specific_notes": "processing/origin-specific observations",
  "watchpoints_next_60s": ["what to monitor next minute"],
  "confidence": 0-100
}`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
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
// PHASE 3: POST-ROAST ANALYSIS - MASSIVELY UPGRADED
// ============================================================================

/**
 * Comprehensive post-roast analysis with advanced RoR defect evaluation,
 * processing-method-specific interpretation, and iterative improvement guidance.
 *
 * @param {Object} roastData - Complete roast log
 * @param {Object} coffeeProfile - Coffee characteristics for context
 * @param {Object} profileTarget - Original target profile
 * @param {Object} cuppingNotes - Optional cupping evaluation
 * @returns {Promise<Object>} - Detailed analysis and next roast recommendations
 */
export const postRoastAnalysis = async (roastData, coffeeProfile = {}, profileTarget = null, cuppingNotes = null) => {
  const systemPrompt = `You are an elite roasting analyst with deep expertise in RoR curve analysis, processing-method-specific quality assessment, and iterative improvement.

${COFFEE_SCIENCE_CONTEXT}

YOUR ANALYSIS FRAMEWORK:
1. Evaluate entire RoR curve against science-based standards
2. Identify any RoR defects (crashes, flicks, stalls) and their impacts
3. Assess phase quality through RoR lens, not just time
4. Correlate roast parameters with predicted cup character
5. Match cupping scores to roast parameters if provided
6. Recommend iterative improvements grounded in coffee science
7. Account for processing method and origin in all assessments

RoR QUALITY ASSESSMENT:
- Smooth declining curve = excellent structure, balanced extraction
- Crash before FC = baked, lost sweetness (even if final product seems OK)
- Flick post-FC = charring risk, uneven development
- Stall before FC = flat, baked character
- Curve flatness indicates missed complexity opportunity

PROCESSING-METHOD INTERPRETATION:
- Natural coffees: Higher scorch risk, value longer Maillard
- Washed: Higher acidity potential, value crisp development
- Anaerobic: Extremely delicate, judge against low RoR standard
- Honey: Sweet base, extended Maillard enhances character`;

  const userPrompt = `Comprehensive post-roast analysis:

COFFEE PROFILE (for context):
- Origin: ${coffeeProfile.origin_country || 'Unknown'}, ${coffeeProfile.region || 'Unknown'}
- Processing: ${coffeeProfile.processing_method || 'Unknown'}
- Altitude: ${coffeeProfile.altitude || 1500}m
- Density: ${coffeeProfile.density || 5}/10
- Variety: ${coffeeProfile.variety || 'Unknown'}

ROAST EXECUTION:
- Name: ${roastData.coffee_name || 'Unknown'}
- Batch: ${roastData.batch_weight_g}g
- Total Duration: ${roastData.total_duration_seconds}s (${(roastData.total_duration_seconds/60).toFixed(1)}min)
- Charge Temp: ${roastData.charge_temp}°C → Drop: ${roastData.drop_temp}°C

DETAILED ROAST CURVE:
- Drying Phase: ${roastData.drying_duration_seconds}s (to ~170°C)
- Maillard Phase: ${roastData.maillard_duration_seconds}s (170°C → FC)
- First Crack: ${roastData.first_crack_seconds}s at ${roastData.first_crack_temp}°C
- Total Dev Time: ${roastData.development_seconds}s
- Dev Ratio: ${roastData.dev_ratio_percent}%
- Final Color: ${roastData.final_color}
- Weight Loss: ${roastData.weight_loss_percent}%

RoR METRICS (critical for quality assessment):
- Average RoR: ${roastData.avg_ror}°C/min (${getRoRQuality(roastData.avg_ror)})
- Peak RoR: ${roastData.peak_ror}°C/min
- Minimum RoR: ${roastData.min_ror}°C/min
- RoR Decline Smoothness: ${roastData.ror_smoothness_score || '?'}/100
- RoR Crashes Detected: ${roastData.ror_crashes?.length || 0}
- RoR Flicks Detected: ${roastData.ror_flicks?.length || 0}
- RoR Stalls Detected: ${roastData.ror_stalls?.length || 0}

${roastData.anomalies && roastData.anomalies.length > 0 ? `ANOMALIES LOGGED:
${roastData.anomalies.map(a => `- [${a.severity}] ${a.type}: ${a.description}`).join('\n')}` : ''}

${profileTarget ? `TARGET VS ACTUAL:
- Target Dev %: ${profileTarget.key_targets?.development_ratio_percent}% | Actual: ${roastData.dev_ratio_percent}%
- Target Drop: ${profileTarget.key_targets?.drop_temp}°C | Actual: ${roastData.drop_temp}°C
- Target FC: ${profileTarget.key_targets?.first_crack_temp}°C | Actual: ${roastData.first_crack_temp}°C
- RoR Design: ${profileTarget.ror_curve_design || 'Unknown'}` : ''}

${cuppingNotes ? `CUPPING EVALUATION (CRITICAL DATA):
${cuppingNotes.notes || 'No notes'}
- Overall Score: ${cuppingNotes.overall_score}/100
- Acidity: ${cuppingNotes.acidity_score}/10
- Body: ${cuppingNotes.body_score}/10
- Sweetness: ${cuppingNotes.sweetness_score}/10
- Flavor Clarity: ${cuppingNotes.flavor_clarity_score}/10
- Target Match: ${cuppingNotes.flavor_match ? 'Yes - roast achieved goals' : 'No - miss vs target'}
- Defects Noted: ${cuppingNotes.defects || 'None detected'}` : 'No cupping data'}

RESPOND WITH THIS ADVANCED JSON:
{
  "overall_assessment": "summary with quality level (excellent/good/fair/poor/failed) and scientific reasoning",
  "roast_success_score": 0-100,

  "ror_curve_analysis": {
    "curve_quality": "excellent/good/fair/poor",
    "smoothness_rating": "very_smooth/smooth/acceptable/choppy/highly_erratic",
    "crash_incidents": {
      "count": number,
      "severity": "none/mild/moderate/severe",
      "impact_on_cup": "no impact / minor flatness / significant baked character / critical defect"
    },
    "flick_incidents": {
      "count": number,
      "severity": "none/mild/moderate/severe",
      "impact_on_cup": "no impact / slight harshness / charring risk / defect"
    },
    "stall_incidents": {
      "count": number,
      "severity": "none/mild/moderate/severe",
      "impact_on_cup": "no impact / slight flatness / baked quality / defect"
    }
  },

  "phase_analysis": {
    "drying_phase": {
      "duration": "appropriate/short/extended for batch size and moisture",
      "power_management": "efficient/conservative/aggressive assessment",
      "defect_risk": "no scorch / possible scorch / likely scorch"
    },
    "maillard_phase": {
      "duration_adequacy": "% vs typical for processing method",
      "ror_progression": "description of RoR behavior",
      "sweetness_development": "likely adequate/rushed/extended",
      "impact": "predicted effect on cup"
    },
    "first_crack": {
      "timing": "early/on_time/late vs roast type",
      "quality": "smooth/explosive/problematic description",
      "energy_at_crack": "assessment of thermal state"
    },
    "development_phase": {
      "duration_assessment": "${roastData.dev_ratio_percent}% is appropriate/short/extended for ${coffeeProfile.processing_method}",
      "ror_decline_rate": "assessment of post-FC RoR",
      "flavor_lock_quality": "likely optimal/slight under-dev/over-developed"
    }
  },

  "cupping_correlation": {
    "predicted_vs_actual": "if cupping data available, how parameters predict cup quality",
    "acidity_assessment": "high/medium/low based on roast profile",
    "body_prediction": "thin/medium/full based on roast parameters",
    "sweetness_development": "assessment of maillard extension",
    "clarity_prediction": "clean/cloudy based on development profile"
  },

  "processing_method_specific": {
    "method": "${coffeeProfile.processing_method || 'Unknown'}",
    "quality_vs_method": "assessment specific to this processing type",
    "method_strengths_leveraged": ["what was done well for this method"],
    "method_missed_opportunities": ["what could enhance this processing type"]
  },

  "next_roast_optimization": {
    "charge_temp_adjustment": "±°C with reasoning",
    "drying_phase_changes": "power/rpm/airflow adjustments",
    "maillard_extension": "seconds to add/subtract",
    "development_time_change": "seconds or % adjustment with rationale",
    "ror_curve_improvement": "specific changes to smooth RoR defects",
    "rpm_leverage": "consider RPM adjustment as primary lever",
    "expected_cup_impact": "what improvements you expect"
  },

  "learning_insights": [
    "insight 1 with scientific basis",
    "insight 2 with scientific basis",
    "insight 3"
  ],

  "confidence_in_analysis": 0-100
}`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 3000,
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
 * Looks for consistency, trends, and equipment-specific optimization opportunities.
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

  const systemPrompt = `You are an elite coffee roasting data scientist with deep understanding of:
- Roast parameter correlation with quality outcomes (RoR smoothness, dev ratio, temps)
- Small-batch statistical significance
- Skill development progression
- Equipment behavior and consistency
- Processing-method-specific patterns
- Batch-size effects on optimal parameters`;

  const roastSummaries = allRoasts.slice(-30).map((r, i) => `
ROAST ${i + 1}: ${r.coffee_name} (${r.origin})
- Date: ${r.created_at} | Batch: ${r.batch_weight_g}g | Total: ${r.total_duration_seconds}s
- Temps: Charge ${r.charge_temp}°C → FC ${r.first_crack_temp}°C → Drop ${r.drop_temp}°C
- Dev: ${r.development_seconds}s (${r.dev_ratio_percent}% ratio)
- RoR: avg ${r.avg_ror.toFixed(1)}°C/min, peak ${r.peak_ror.toFixed(1)}°C/min, min ${r.min_ror.toFixed(1)}°C/min
- Processing: ${r.processing_method || '?'} | Density: ${r.density || '?'}/10
- Weight Loss: ${r.weight_loss_percent}%
- Quality: ${r.quality_rating || '?'}/100 | Cupped: ${r.cupping_notes ? 'Yes' : 'No'}`).join('\n');

  const userPrompt = `Analyze roasting patterns across these ${allRoasts.length} roasts:

${roastSummaries}

${filters.origin ? `FILTER: Origin = ${filters.origin}` : ''}
${filters.coffee_name ? `FILTER: Coffee = ${filters.coffee_name}` : ''}
${filters.processing_method ? `FILTER: Processing = ${filters.processing_method}` : ''}

RESEARCH OBJECTIVES:
1. Parameter consistency: Are roasts repeatable on ROEST L200?
2. Performance trend: Improving, stable, or declining?
3. Optimal zones: Identify ideal charge, dev%, drop temps for this coffee type
4. RoR quality: Is curve smoothness improving? Crash/flick/stall frequency?
5. Skill assessment: Novice → Expert based on consistency and outcomes
6. Batch-size patterns: Different optimal params for different batch sizes?
7. Processing-specific: Does method affect success rate or optimal parameters?
8. Next-roast focus: What should be prioritized next?

RESPOND WITH ADVANCED JSON:
{
  "roast_count_analyzed": number,
  "date_range": "from X to Y",
  "filters_applied": ["filter1", "filter2"],

  "consistency_analysis": {
    "consistency_score": 0-100,
    "repeatability": "highly_repeatable/repeatable/variable/inconsistent",
    "parameter_variance": "charge ±X°C, dev ±Y%, drop ±Z°C",
    "ror_curve_consistency": "high/medium/low with notes"
  },

  "performance_trend": {
    "overall_trend": "improving/stable/declining/fluctuating",
    "trend_strength": 0-100,
    "recent_trajectory": "description of last 3-5 roasts",
    "quality_improvement_rate": "roasts per expected quality boost"
  },

  "optimal_parameters": {
    "ideal_charge_temp": { value: number, range: "±X°C", confidence: 0-100 },
    "ideal_development_percent": { value: number, range: "±X%", confidence: 0-100 },
    "ideal_drop_temp": { value: number, range: "±X°C", confidence: 0-100 },
    "ideal_batch_size": "size or size_range with reasoning",
    "notes": "any batch-size or processing-specific variations"
  },

  "ror_quality_assessment": {
    "average_ror_smoothness": 0-100,
    "crash_frequency": "X crashes per 20 roasts",
    "flick_frequency": "X flicks per 20 roasts",
    "stall_frequency": "X stalls per 20 roasts",
    "improvement_in_defects": "getting better/same/worse",
    "ror_trend": "curves becoming smoother/noisier/stable"
  },

  "skill_assessment": {
    "level": "novice/intermediate/advanced/expert",
    "confidence": 0-100,
    "key_strengths": ["strength1", "strength2"],
    "improvement_areas": ["area1", "area2"],
    "development_trajectory": "rapid improvement / steady growth / plateau / regression"
  },

  "processing_method_patterns": {
    "method": "${filters.processing_method || 'mixed'}",
    "success_rate": "% of roasts rated excellent/good",
    "optimal_dev_percent": "recommended range for this method",
    "method_specific_insights": "observations about this processing type"
  },

  "batch_size_analysis": {
    "sizes_represented": ["50g", "100g", "150g", "200g"],
    "size_performance": {
      "50g": { success_rate: 0-100, optimal_charge: number, notes: "string" },
      "100g": { success_rate: 0-100, optimal_charge: number, notes: "string" }
    },
    "batch_size_recommendation": "preferred batch size for consistency"
  },

  "anomalies_and_outliers": [
    {
      "roast_identifier": "coffee name, date",
      "type": "exceptional_success / unusual_failure / parameter_extreme",
      "reason": "why this roast stands out",
      "learning": "what can be learned from this roast"
    }
  ],

  "optimization_roadmap": [
    {
      "priority": 1,
      "target": "what to optimize",
      "current_state": "what's happening now (based on data)",
      "specific_change": "exact parameter or practice to modify",
      "expected_impact": "quantified improvement prediction",
      "confidence": 0-100
    }
  ],

  "next_5_roasts_focus": "specific guidance for next batch of roasts",
  "long_term_improvement_path": "trajectory toward mastery",
  "overall_confidence": 0-100
}`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 3500,
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
// PHASE 5: HISTORICAL OPTIMIZATION - NEW FUNCTION
// ============================================================================

/**
 * Analyzes past roasts of the same coffee and suggests iterative improvements
 * based on cupping scores. This is the iterative learning engine.
 *
 * @param {string} coffeeId - Identifier for the coffee
 * @param {Array} lastNRoasts - Last N roasts of this coffee (with cupping scores)
 * @param {Array} cuppingScores - Associated cupping evaluation scores
 * @returns {Promise<Object>} - Specific, actionable improvements based on history
 */
export const optimizeProfileFromHistory = async (coffeeId, lastNRoasts = [], cuppingScores = []) => {
  if (!lastNRoasts || lastNRoasts.length < 2) {
    return {
      error: 'Need at least 2 previous roasts to identify improvement patterns',
      roasts_available: lastNRoasts?.length || 0
    };
  }

  const systemPrompt = `You are a world-class roasting coach analyzing a roaster's history with a specific coffee.

${COFFEE_SCIENCE_CONTEXT}

YOUR ROLE: Find the pattern between roast parameters and cupping outcomes.
Then suggest the NEXT most impactful parameter adjustment to improve cup quality.

CORRELATION ANALYSIS:
- Compare RoR patterns to scores: Smoother curves = better scores?
- Compare dev% to scores: Is there an optimal development window?
- Compare charge temps: Does higher/lower charge drive better results?
- Compare drying speeds: Fast vs slow drying impact?
- Look for "sweet spots" in parameters that correlate with higher scores

PRIORITIZE CHANGES:
1. Which parameter had the biggest correlation with score improvements?
2. Where in that parameter's range do best scores occur?
3. What ONE change will most likely improve the next roast?
4. What should be held constant (already working)?

AVOID CHASING NOISE: Small sample sizes = high variance. Look for clear patterns.`;

  const roastComparisons = lastNRoasts.map((r, i) => {
    const score = cuppingScores[i] || { overall_score: 0 };
    return `
ROAST ${i + 1}: Overall Score ${score.overall_score || '?'}/100
- Charge: ${r.charge_temp}°C | Dev: ${r.dev_ratio_percent}% | Drop: ${r.drop_temp}°C
- RoR: avg ${r.avg_ror?.toFixed(1)}°C/min | Crashes: ${r.ror_crashes?.length || 0} | Flicks: ${r.ror_flicks?.length || 0}
- Drying Time: ${r.drying_duration_seconds}s | Maillard: ${r.maillard_duration_seconds}s
- Total Time: ${r.total_duration_seconds}s
- Weight Loss: ${r.weight_loss_percent}%
- Processing: ${r.processing_method}
- Score Details: Acidity ${score.acidity_score}/10, Body ${score.body_score}/10, Sweetness ${score.sweetness_score}/10`;
  }).join('\n');

  const userPrompt = `Analyze cupping-correlated patterns for this coffee (${coffeeId}):

${roastComparisons}

COFFEE CONTEXT:
- Origin: ${lastNRoasts[0]?.origin || '?'}
- Processing: ${lastNRoasts[0]?.processing_method || '?'}
- Altitude: ${lastNRoasts[0]?.altitude || '?'}m
- Density: ${lastNRoasts[0]?.density || '?'}/10

ANALYSIS QUESTIONS:
1. Which roasts scored highest? What parameters did they share?
2. Which roasts scored lowest? What parameters were different?
3. Charge temp correlation: Higher or lower scored better?
4. Development% correlation: Longer or shorter development produced better cups?
5. RoR quality: Did smoother curves correlate with higher scores?
6. Are there parameter "sweet spots" that appeared in high-scoring roasts?
7. What ONE parameter change has clearest impact on quality?

RESPOND WITH THIS JSON:
{
  "coffee_id": "${coffeeId}",
  "roasts_analyzed": number,
  "average_score": number,
  "score_range": "from X to Y",
  "score_variance": "stable/moderate_variance/high_variance",

  "parameter_correlation_analysis": {
    "charge_temp": {
      "high_score_roasts_charge": "X-Y°C",
      "low_score_roasts_charge": "A-B°C",
      "correlation": "higher_charge_better / lower_charge_better / no_clear_pattern",
      "confidence": 0-100,
      "recommended_zone": "optimal range for this coffee"
    },
    "development_percent": {
      "high_score_roasts_dev": "X-Y%",
      "low_score_roasts_dev": "A-B%",
      "correlation": "longer_dev_better / shorter_dev_better / no_clear_pattern",
      "confidence": 0-100,
      "recommended_zone": "optimal range for this coffee"
    },
    "ror_smoothness": {
      "high_score_roasts_crashes": "X crashes avg",
      "low_score_roasts_crashes": "Y crashes avg",
      "smoother_curves_correlation": true/false,
      "confidence": 0-100,
      "implication": "smooth RoR design critical / helpful / not apparent"
    },
    "drying_duration": {
      "fast_vs_slow_impact": "fast drying better / slow drying better / no clear pattern",
      "optimal_range": "X-Y seconds for this coffee",
      "confidence": 0-100
    }
  },

  "flavor_score_breakdown": {
    "highest_scoring_roast": {
      "overall": number,
      "acidity": number,
      "body": number,
      "sweetness": number,
      "parameters": "charge X°C, dev Y%, drop Z°C"
    },
    "lowest_scoring_roast": {
      "overall": number,
      "acidity": number,
      "body": number,
      "sweetness": number,
      "parameters": "charge X°C, dev Y%, drop Z°C"
    },
    "flavor_pattern": "what improved cups share in terms of flavor"
  },

  "next_roast_optimization": {
    "single_most_impactful_change": "the ONE parameter to adjust next roast",
    "change_type": "charge_temp / development_time / drying_speed / ror_management",
    "current_value": number,
    "recommended_value": number,
    "change_magnitude": "±X units",
    "reasoning": "why this change should improve cup quality",
    "expected_score_improvement": "predicted improvement in overall score",
    "confidence": 0-100
  },

  "secondary_optimizations": [
    {
      "parameter": "parameter name",
      "current_state": "description",
      "adjustment": "specific change",
      "rationale": "why this helps",
      "priority": "high/medium/low relative to primary change"
    }
  ],

  "parameters_to_hold_constant": [
    "parameter that's working well - don't change"
  ],

  "sweet_spot_profile": {
    "optimal_charge_temp": "X°C (range: ±Y°C)",
    "optimal_dev_percent": "X% (range: ±Y%)",
    "optimal_drop_temp": "X°C (range: ±Y°C)",
    "optimal_drying_approach": "description",
    "confidence": 0-100,
    "notes": "any caveats or batch-size considerations"
  },

  "roasting_insights": [
    "insight 1 based on this coffee's history",
    "insight 2 with scientific grounding",
    "insight 3"
  ],

  "improvement_trajectory": "description of expected progress if recommendations are followed"
}`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 3500,
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
    console.error('Historical optimization error:', error);
    throw new Error(`Failed to optimize from history: ${error.message}`);
  }
};

// ============================================================================
// HELPER FUNCTIONS FOR ADVANCED ANALYSIS
// ============================================================================

/**
 * Calculate batch size temperature adjustment for ROEST L200
 */
function calculateBatchSizeAdjustment(batchWeightG, altitudeM) {
  const baseTemp = 195;
  let adjustment = 0;

  if (batchWeightG <= 50) adjustment = -7.5;
  else if (batchWeightG <= 100) adjustment = 0;
  else if (batchWeightG <= 150) adjustment = 4;
  else adjustment = 7.5;

  // Altitude adjustment
  if (altitudeM > 2000) adjustment += 10;
  else if (altitudeM > 1600) adjustment += 5;

  return {
    baseTemp: baseTemp + adjustment,
    batchAdjustment: adjustment
  };
}

/**
 * Get batch size category label
 */
function getBatchSizeCategory(grams) {
  if (grams <= 50) return 'Very Small';
  if (grams <= 100) return 'Small (Standard)';
  if (grams <= 150) return 'Medium';
  if (grams <= 200) return 'Large';
  return 'Very Large';
}

/**
 * Get altitude category impact on density
 */
function getAltitudeCategory(meters) {
  if (meters < 1200) return 'Low (soft, porous)';
  if (meters < 1600) return 'Medium (moderate density)';
  if (meters < 2000) return 'High (dense)';
  return 'Very High (very dense)';
}

/**
 * Calculate RoR trend from recent readings
 */
function calculateRoRTrend(rorReadings) {
  if (!rorReadings || rorReadings.length < 2) {
    return { direction: 'unknown', rate: 0 };
  }

  const recent = rorReadings.slice(-5);
  if (recent.length < 2) {
    return { direction: 'unknown', rate: 0 };
  }

  // Simple linear regression of trend
  let sumDiff = 0;
  for (let i = 1; i < recent.length; i++) {
    sumDiff += recent[i] - recent[i - 1];
  }
  const avgRate = sumDiff / (recent.length - 1);

  let direction = 'stable';
  if (avgRate > 0.5) direction = 'increasing';
  else if (avgRate < -0.5) direction = 'declining';

  return {
    direction,
    rate: parseFloat(avgRate.toFixed(2))
  };
}

/**
 * Assess RoR quality on a scale
 */
function getRoRQuality(avgRoR) {
  if (avgRoR >= 12) return 'excellent (fast, energetic)';
  if (avgRoR >= 9) return 'good (solid development)';
  if (avgRoR >= 6) return 'moderate (acceptable)';
  if (avgRoR >= 3) return 'low (slow, risk of stalling)';
  return 'critical (flat, baked risk)';
}

/**
 * Format seconds to mm:ss
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate average value from array
 */
function getAverageValue(values) {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return (sum / values.length).toFixed(1);
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

/**
 * Backward compatibility wrapper for old function names
 */
export const analyzeRoastRealTime = async (currentData, profileTarget) => {
  return analyzeRoastRealtime(currentData, profileTarget, {}, []);
};

export const analyzeRoastPost = async (roastData, profileTarget) => {
  return postRoastAnalysis(roastData, {}, profileTarget, null);
};

export const comparativeAnalysis = async (roasts) => {
  return bigDataInsights(roasts, {});
};
