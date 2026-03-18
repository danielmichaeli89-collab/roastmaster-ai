import Anthropic from '@anthropic-ai/sdk';
import db from '../config/database.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';

export const generateRoastProfile = async (coffeeData, targetFlavor) => {
  const prompt = `You are an expert specialty coffee roaster with deep knowledge of coffee science and roasting dynamics.
You are assisting in generating an optimal roast profile based on the following green coffee characteristics.

GREEN COFFEE PROFILE:
- Origin: ${coffeeData.origin_country || 'Unknown'}, ${coffeeData.region || 'Unknown'}
- Farm: ${coffeeData.farm || 'Unknown'}
- Variety: ${coffeeData.variety || 'Mixed Lot'}
- Processing Method: ${coffeeData.processing_method || 'Unknown'}
- Altitude: ${coffeeData.altitude || 'Unknown'} meters
- Moisture Content: ${coffeeData.moisture_content || 'Unknown'}%
- Density Score: ${coffeeData.density || 'Unknown'}/10
- Screen Size: ${coffeeData.screen_size || 'Unknown'}
- Harvest Year: ${coffeeData.harvest_year || 'Current'}
- Flavor Notes: ${coffeeData.flavor_notes || 'To be discovered'}

TARGET FLAVOR PROFILE: ${targetFlavor || 'Balanced with bright acidity and clean finish'}

Based on these characteristics, generate a detailed roast profile that will highlight the coffee's best qualities while achieving the target flavor profile.

Consider:
1. Initial charge temperature (typically 185-220°C depending on bean density and processing)
2. Four roasting phases with specific targets:
   - Drying phase: Remove moisture, develop body
   - Yellowing/Browning: Begin Maillard reaction
   - First crack window: Develop complexity
   - Development phase: Balance acidity and body

For each phase, specify:
- Target bean temperature range
- Power level (%)
- Airflow level (%)
- Drum RPM
- Expected duration

Also provide:
- Total target roast duration
- Target development time percentage (typically 15-25% after first crack)
- Specific roasting considerations for this coffee's origin and processing
- Expected drop temperature for the target flavor
- Warnings about potential issues

Format your response as a structured JSON object with this exact structure:
{
  "phases": [
    {
      "name": "Phase name",
      "target_temp": temperature in Celsius,
      "power": power percentage,
      "airflow": airflow percentage,
      "rpm": drum RPM,
      "duration": expected duration in seconds,
      "description": "what to watch for and why"
    }
  ],
  "total_duration_target": total seconds,
  "development_time_pct": percentage after first crack,
  "charge_temp": 195,
  "drop_temp": drop temperature in Celsius,
  "reasoning": "detailed explanation of why this profile suits this coffee",
  "key_watchpoints": ["observable markers during roasting"],
  "anomaly_triggers": ["conditions that suggest problems"]
}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  try {
    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return {
      error: 'Failed to generate profile',
      raw_response: response.content[0].text
    };
  }
};

export const analyzeRoastRealTime = async (currentData, profileTarget) => {
  const prompt = `You are monitoring a coffee roast in real-time. Analyze the current roasting data against the target profile and identify any anomalies or issues requiring immediate attention.

CURRENT ROAST DATA:
- Elapsed Time: ${currentData.elapsed_seconds} seconds
- Bean Temperature: ${currentData.bean_temp_1}°C / ${currentData.bean_temp_2}°C
- Air Temperature: ${currentData.air_temp}°C
- RoR (Bean Temp): ${currentData.ror_bt}°C/min
- Drum Pressure: ${currentData.drum_pressure} bar
- Power: ${currentData.power_pct}%
- Airflow: ${currentData.airflow_pct}%
- RPM: ${currentData.rpm}
- Current Phase: ${currentData.phase}

TARGET PROFILE:
- Phase Target: ${profileTarget.current_phase_name}
- Target Temperature: ${profileTarget.target_temp}°C
- Target RoR: ${profileTarget.target_ror}°C/min
- Expected Duration: ${profileTarget.expected_duration} seconds

CRITICAL ANOMALY CHECKS:
1. RoR CRASH: Sudden drop in Rate of Rise >2°C/min suggests stalling or temperature overshoot
2. STALLING: RoR approaching 0 or negative indicates development issues
3. TEMPERATURE DEVIATION: >5°C above target = warning, >10°C = critical
4. DEVELOPMENT CONCERNS: If development% is trending >25%, coffee may develop bitter notes
5. DRUM ISSUES: Pressure below 0.5 bar or rapidly changing suggests mechanical problems

Provide analysis in this JSON format:
{
  "is_anomaly": boolean,
  "severity": "info" | "warning" | "critical",
  "anomaly_type": "string or null",
  "description": "what's happening and why",
  "immediate_action": "specific adjustment recommendation or null if no action needed",
  "confidence": 0-1,
  "reasoning": "explain your assessment"
}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  try {
    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse real-time analysis:', error);
    return {
      is_anomaly: false,
      severity: 'info',
      description: 'Analysis in progress',
      error: true
    };
  }
};

export const analyzeRoastPost = async (roastData, profileTarget) => {
  const prompt = `You are a specialty coffee roasting expert analyzing a completed roast. Provide comprehensive feedback on roasting performance, flavor development trajectory, and recommendations for future roasts.

ROAST SUMMARY:
- Coffee: ${roastData.coffee_name || 'Unknown'} from ${roastData.origin || 'Unknown'}
- Batch Weight: ${roastData.batch_weight_g}g
- Total Duration: ${roastData.total_duration} seconds (${(roastData.total_duration / 60).toFixed(1)} minutes)
- Charge Temperature: ${roastData.charge_temp}°C
- First Crack: ${roastData.first_crack_time} seconds
- Development Time: ${roastData.development_time} seconds (${roastData.development_pct}%)
- Drop Temperature: ${roastData.drop_temp}°C
- Weight Loss: ${roastData.weight_loss_pct}%
- Final Color: ${roastData.final_color}

ROASTING METRICS ANALYSIS:
${roastData.roast_events ? `
Events Detected:
${roastData.roast_events.map(e => `- ${e.event_type} at ${e.elapsed_seconds}s: ${e.description}`).join('\n')}
` : ''}

${roastData.anomalies ? `
Anomalies During Roast:
${roastData.anomalies.map(a => `- [${a.severity}] ${a.anomaly_type}: ${a.description}`).join('\n')}
` : ''}

TARGET PROFILE COMPARISON:
${profileTarget ? `
- Target Development %: ${profileTarget.development_time_pct}%
- Target Drop Temp: ${profileTarget.drop_temp}°C
- Variance Analysis: Compare actual vs. target
` : 'No profile specified'}

CUPPING NOTES (if available):
${roastData.cupping_notes || 'No cupping data yet'}

Provide detailed analysis in this JSON format:
{
  "overall_assessment": "summary of roast quality",
  "maillard_development": {
    "assessment": "was Maillard reaction adequate?",
    "indicators": "what evidence supports this"
  },
  "first_crack_analysis": {
    "timing": "was FC at expected time?",
    "quality": "smooth, explosive, or problematic?"
  },
  "development_phase": {
    "quality": "was development adequate?",
    "concerns": "any issues noted?"
  },
  "flavor_trajectory": {
    "predicted_flavor": "based on roasting curve",
    "expected_notes": ["likely flavor characteristics"]
  },
  "roasting_technique": {
    "strengths": ["what was done well"],
    "improvements": ["what could be better"],
    "specific_adjustments": "recommendations for next roast of this coffee"
  },
  "anomalies_impact": "how did any anomalies affect the roast?",
  "comparable_roasts": "comparison to typical results for this coffee type",
  "next_roast_guidance": {
    "temperature_adjustment": "°C adjustment to try",
    "development_time_adjustment": "seconds or percentage",
    "rationale": "why make these changes",
    "expected_impact": "what improvement to expect"
  }
}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  try {
    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse post-roast analysis:', error);
    return {
      overall_assessment: 'Analysis in progress',
      error: true
    };
  }
};

export const comparativeAnalysis = async (roasts) => {
  if (!roasts || roasts.length < 2) {
    return {
      error: 'Need at least 2 roasts for comparative analysis'
    };
  }

  const roastSummaries = roasts.map((r, i) => `
ROAST ${i + 1}:
- Coffee: ${r.coffee_name}
- Date: ${r.created_at}
- Total Duration: ${r.total_duration}s
- Development %: ${r.development_pct}%
- First Crack: ${r.first_crack_time}s
- Drop Temp: ${r.drop_temp}°C
- Color: ${r.final_color}
- Weight Loss: ${r.weight_loss_pct}%
- Quality Rating: ${r.quality_rating || 'Not rated'}
`).join('\n');

  const prompt = `You are analyzing multiple roasts of the same coffee to identify patterns, improvements, and learning opportunities.

${roastSummaries}

Compare these roasts and provide insights on:
1. Consistency of execution
2. Whether changes made between roasts improved results
3. Optimization opportunities
4. The roaster's skill development
5. Ideal target parameters based on these roasts

Format response as JSON:
{
  "roast_count": number,
  "coffee_consistency": "how consistent were results?",
  "improvement_trend": "are recent roasts better than earlier ones?",
  "key_findings": ["insight 1", "insight 2", ...],
  "optimization_path": {
    "next_target_temp": temperature recommendation,
    "next_target_development": percentage recommendation,
    "rationale": "why these targets"
  },
  "skill_assessment": "evaluation of roaster's technique development",
  "consistency_score": 0-100
}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  try {
    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse comparative analysis:', error);
    return {
      error: 'Failed to complete comparative analysis',
      roast_count: roasts.length
    };
  }
};
