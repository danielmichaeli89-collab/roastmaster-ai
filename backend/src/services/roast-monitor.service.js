/**
 * ROAST MONITOR SERVICE
 *
 * Manages real-time roast monitoring with:
 * - Rule-based anomaly detection (instant, no API latency)
 * - State management and phase tracking
 * - RoR calculation and metrics
 * - Phase detection and transitions
 * - Development ratio calculation
 */

export class RoastMonitor {
  constructor(roastId, profileData = {}) {
    // Core state
    this.roastId = roastId;
    this.startTime = Date.now();
    this.dataPoints = [];
    this.anomalies = [];
    this.events = [];

    // Historical tracking (for smoothing and RoR calculation)
    this.temperatureHistory = [];
    this.rorHistory = [];
    this.powerHistory = [];
    this.airflowHistory = [];

    // Phase tracking
    this.currentPhase = 'drying';
    this.phaseTransitions = [];

    // Event markers
    this.firstCrackTime = null;
    this.firstCrackTemp = null;
    this.secondCrackTime = null;
    this.dropTime = null;
    this.dropTemp = null;

    // Target profile reference
    this.profileData = profileData;

    // Metrics
    this.maxRoR = 0;
    this.minRoR = 999;
    this.avgRoR = 0;
    this.chargeTemp = null;
    this.weightLoss = 0;
  }

  /**
   * Record a new data point from the roaster.
   * Called every 10 seconds typically.
   */
  recordDataPoint(dataPoint) {
    const point = {
      timestamp: dataPoint.timestamp || Date.now(),
      elapsed_seconds: dataPoint.elapsed_seconds,
      bean_temp_1: dataPoint.bean_temp_1 || 0,
      bean_temp_2: dataPoint.bean_temp_2 || 0,
      air_temp: dataPoint.air_temp || 0,
      inlet_temp: dataPoint.inlet_temp || 0,
      drum_temp: dataPoint.drum_temp || 0,
      exhaust_temp: dataPoint.exhaust_temp || 0,
      drum_pressure: dataPoint.drum_pressure || 0,
      ror_bt: dataPoint.ror_bt || 0,
      ror_et: dataPoint.ror_et || 0,
      power_pct: dataPoint.power_pct || 0,
      airflow_pct: dataPoint.airflow_pct || 0,
      rpm: dataPoint.rpm || 0,
      humidity: dataPoint.humidity || 0,
      weight_loss_pct: dataPoint.weight_loss_pct || 0
    };

    this.dataPoints.push(point);

    // Keep rolling window (last 120 seconds of data = 12 readings at 10s intervals)
    if (this.dataPoints.length > 120) {
      this.dataPoints.shift();
    }

    // Update history for RoR calculation and smoothing
    this.temperatureHistory.push({
      elapsed: point.elapsed_seconds,
      bt1: point.bean_temp_1,
      bt2: point.bean_temp_2,
      ror: point.ror_bt
    });

    if (this.temperatureHistory.length > 60) {
      this.temperatureHistory.shift();
    }

    // Track RoR
    this.rorHistory.push(point.ror_bt);
    if (this.rorHistory.length > 60) {
      this.rorHistory.shift();
    }

    // Update metrics
    if (point.ror_bt > 0) {
      this.maxRoR = Math.max(this.maxRoR, point.ror_bt);
      this.minRoR = Math.min(this.minRoR, point.ror_bt);
    }

    // Calculate running average
    if (this.rorHistory.length > 0) {
      this.avgRoR = this.rorHistory.reduce((a, b) => a + b, 0) / this.rorHistory.length;
    }

    // Update phase
    this.updatePhase(point);

    // Update weight loss
    this.weightLoss = point.weight_loss_pct;
  }

  /**
   * Update roast phase based on temperature.
   * Phases: drying → yellowing → browning → first_crack → development
   */
  updatePhase(dataPoint) {
    const bt = dataPoint.bean_temp_1;
    let newPhase = this.currentPhase;

    if (bt < 140) {
      newPhase = 'drying';
    } else if (bt < 160) {
      newPhase = 'yellowing';
    } else if (bt < 195) {
      newPhase = 'browning';
    } else if (!this.firstCrackTime && bt >= 195) {
      // Mark first crack when we hit 195°C
      this.firstCrackTime = dataPoint.elapsed_seconds;
      this.firstCrackTemp = bt;
      newPhase = 'development';
      this.recordPhaseTransition('first_crack', bt, dataPoint.elapsed_seconds);
    } else if (this.firstCrackTime) {
      newPhase = 'development';
    }

    if (newPhase !== this.currentPhase) {
      this.currentPhase = newPhase;
      this.recordPhaseTransition(newPhase, bt, dataPoint.elapsed_seconds);
    }
  }

  /**
   * Record a phase transition.
   */
  recordPhaseTransition(phase, temp, elapsedSeconds) {
    this.phaseTransitions.push({
      phase,
      temp: Math.round(temp),
      elapsed_seconds: elapsedSeconds,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Rule-based anomaly detection.
   * FAST - no AI/API calls, runs in milliseconds.
   * Called for every data point to catch issues immediately.
   */
  detectAnomalies(dataPoint, profileTarget = null) {
    const detected = [];

    if (this.dataPoints.length < 2) {
      return detected;
    }

    detected.push(...this.checkRoRCrash(dataPoint));
    detected.push(...this.checkStalling(dataPoint));
    detected.push(...this.checkTemperatureDeviation(dataPoint, profileTarget));
    detected.push(...this.checkDevelopmentConcerns(dataPoint, profileTarget));
    detected.push(...this.checkDrumPressure(dataPoint));
    detected.push(...this.checkPressureChange(dataPoint));
    detected.push(...this.checkOverTemperature(dataPoint));
    detected.push(...this.checkRoRFlick(dataPoint));

    // Store anomalies
    for (const anomaly of detected) {
      this.anomalies.push({
        ...anomaly,
        elapsed_seconds: dataPoint.elapsed_seconds,
        timestamp: new Date().toISOString()
      });
    }

    return detected;
  }

  /**
   * RoR CRASH: sudden drop > 3°C/min from average
   * Indicates loss of energy, risk of stalling/baking
   */
  checkRoRCrash(dataPoint) {
    const anomalies = [];

    if (this.rorHistory.length < 5) return anomalies;

    const currentRoR = dataPoint.ror_bt;
    const avgRoR = this.rorHistory.reduce((a, b) => a + b, 0) / this.rorHistory.length;
    const drop = avgRoR - currentRoR;

    if (drop > 3 && currentRoR > 0.5 && dataPoint.elapsed_seconds > 60) {
      anomalies.push({
        anomaly_type: 'ror_crash',
        severity: 'warning',
        description: `RoR crashed ${drop.toFixed(1)}°C/min (was ${avgRoR.toFixed(1)}, now ${currentRoR.toFixed(1)})`,
        suggested_action: 'Increase power by 5-10% or reduce airflow to recover energy',
        ai_generated: false
      });
    }

    return anomalies;
  }

  /**
   * STALLING: RoR drops below 2°C/min before first crack
   * Critical risk of baking and underdevelopment
   */
  checkStalling(dataPoint) {
    const anomalies = [];
    const currentRoR = dataPoint.ror_bt;

    // Only check before FC
    if (this.firstCrackTime && dataPoint.elapsed_seconds > this.firstCrackTime) {
      return anomalies;
    }

    if (currentRoR < 2 && dataPoint.elapsed_seconds > 60) {
      if (currentRoR < 0.5) {
        anomalies.push({
          anomaly_type: 'stalling',
          severity: 'critical',
          description: `CRITICAL: RoR stalled at ${currentRoR.toFixed(2)}°C/min - severe underdevelopment risk`,
          suggested_action: 'Immediately increase power by 10-15% and/or reduce airflow',
          ai_generated: false
        });
      } else {
        anomalies.push({
          anomaly_type: 'stalling_risk',
          severity: 'warning',
          description: `Low RoR: ${currentRoR.toFixed(2)}°C/min - approaching stall threshold`,
          suggested_action: 'Monitor closely. Increase power by 5% if RoR continues dropping',
          ai_generated: false
        });
      }
    }

    return anomalies;
  }

  /**
   * TEMPERATURE DEVIATION from target profile
   */
  checkTemperatureDeviation(dataPoint, profileTarget) {
    const anomalies = [];

    if (!profileTarget) return anomalies;

    // Try to extract target from profile structure
    let targetTemp = profileTarget.target_temp;
    if (!targetTemp && profileTarget.phases) {
      // Find current phase target
      const currentPhaseData = profileTarget.phases.find(p => p.name === this.currentPhase);
      if (currentPhaseData) {
        targetTemp = currentPhaseData.end_temp_celsius;
      }
    }

    if (!targetTemp) return anomalies;

    const currentTemp = dataPoint.bean_temp_1;
    const deviation = currentTemp - targetTemp;

    if (Math.abs(deviation) > 12) {
      const direction = deviation > 0 ? 'above' : 'below';
      anomalies.push({
        anomaly_type: 'temperature_deviation_critical',
        severity: 'critical',
        description: `Temperature ${Math.abs(deviation).toFixed(0)}°C ${direction} target (${currentTemp.toFixed(0)}°C vs ${targetTemp.toFixed(0)}°C)`,
        suggested_action: deviation > 0 ? 'Reduce power by 10-15%' : 'Increase power by 10-15%',
        ai_generated: false
      });
    } else if (Math.abs(deviation) > 5) {
      const direction = deviation > 0 ? 'above' : 'below';
      anomalies.push({
        anomaly_type: 'temperature_deviation',
        severity: 'warning',
        description: `Temperature ${Math.abs(deviation).toFixed(0)}°C ${direction} target`,
        suggested_action: deviation > 0 ? 'Reduce power by 5%' : 'Increase power by 5%',
        ai_generated: false
      });
    }

    return anomalies;
  }

  /**
   * OVER-DEVELOPMENT: development ratio exceeds 25%
   * Risk of bitter, over-roasted flavors
   */
  checkDevelopmentConcerns(dataPoint, profileTarget) {
    const anomalies = [];

    // Only check after first crack
    if (!this.firstCrackTime || dataPoint.elapsed_seconds <= this.firstCrackTime) {
      return anomalies;
    }

    const devSeconds = dataPoint.elapsed_seconds - this.firstCrackTime;

    // Check against profile target
    if (profileTarget?.key_targets?.total_development_time_seconds) {
      const targetDevSeconds = profileTarget.key_targets.total_development_time_seconds;
      const devRatio = (devSeconds / targetDevSeconds) * 100;

      if (devRatio > 125) {
        anomalies.push({
          anomaly_type: 'over_development',
          severity: 'critical',
          description: `Over-development: ${devRatio.toFixed(0)}% of target (${devSeconds}s vs ${targetDevSeconds}s target)`,
          suggested_action: 'Drop immediately to prevent bitter, charred flavors',
          ai_generated: false
        });
      } else if (devRatio > 110) {
        anomalies.push({
          anomaly_type: 'over_development_warning',
          severity: 'warning',
          description: `Development approaching limit: ${devRatio.toFixed(0)}% of target`,
          suggested_action: 'Prepare to drop soon',
          ai_generated: false
        });
      }
    }

    // Fallback: generic 25% development warning
    if (devSeconds > 150 && !this.dropTime) {
      anomalies.push({
        anomaly_type: 'extended_development',
        severity: 'warning',
        description: `Extended development: ${devSeconds}s post-FC (typical 90-120s)`,
        suggested_action: 'Monitor for over-roast. Drop soon if aiming for light-medium roast',
        ai_generated: false
      });
    }

    return anomalies;
  }

  /**
   * DRUM PRESSURE issues
   */
  checkDrumPressure(dataPoint) {
    const anomalies = [];

    if (!dataPoint.drum_pressure || dataPoint.drum_pressure === 0) {
      return anomalies;
    }

    if (dataPoint.drum_pressure < 0.3) {
      anomalies.push({
        anomaly_type: 'low_drum_pressure',
        severity: 'warning',
        description: `Low drum pressure: ${dataPoint.drum_pressure.toFixed(2)} bar (normal: 0.5-1.0)`,
        suggested_action: 'Check motor, bearings, and drive belt. Mechanical issue likely.',
        ai_generated: false
      });
    } else if (dataPoint.drum_pressure > 1.8) {
      anomalies.push({
        anomaly_type: 'high_drum_pressure',
        severity: 'warning',
        description: `High drum pressure: ${dataPoint.drum_pressure.toFixed(2)} bar (normal: 0.5-1.0)`,
        suggested_action: 'Check for airflow blockage, exhaust obstruction, or overload',
        ai_generated: false
      });
    }

    return anomalies;
  }

  /**
   * SUDDEN PRESSURE CHANGE
   */
  checkPressureChange(dataPoint) {
    const anomalies = [];

    if (this.dataPoints.length < 2) return anomalies;

    const prevPoint = this.dataPoints[this.dataPoints.length - 2];
    const prevPressure = prevPoint.drum_pressure || 0;
    const currentPressure = dataPoint.drum_pressure || 0;

    if (prevPressure > 0) {
      const change = Math.abs(currentPressure - prevPressure) / prevPressure;
      if (change > 0.15) {
        // 15% change
        anomalies.push({
          anomaly_type: 'pressure_spike',
          severity: 'warning',
          description: `Sudden pressure change: ${(change * 100).toFixed(0)}% shift`,
          suggested_action: 'Adjust airflow gradually. Check for bean bridges or chaff buildup.',
          ai_generated: false
        });
      }
    }

    return anomalies;
  }

  /**
   * OVER-TEMPERATURE: exceeds safe limits
   */
  checkOverTemperature(dataPoint) {
    const anomalies = [];

    if (dataPoint.bean_temp_1 > 240) {
      anomalies.push({
        anomaly_type: 'dangerous_temperature',
        severity: 'critical',
        description: `CRITICAL: Bean temperature ${dataPoint.bean_temp_1.toFixed(0)}°C (max safe: 240°C)`,
        suggested_action: 'Drop immediately. Risk of equipment damage and severe over-roast.',
        ai_generated: false
      });
    }

    return anomalies;
  }

  /**
   * RoR FLICK: sudden spike after decline
   * Indicates instability, usually airflow-related
   */
  checkRoRFlick(dataPoint) {
    const anomalies = [];

    if (this.rorHistory.length < 5) return anomalies;

    const current = dataPoint.ror_bt;
    const prev = this.rorHistory[this.rorHistory.length - 2];
    const prevPrev = this.rorHistory[this.rorHistory.length - 3];

    // Look for: declining trend broken by spike
    if (prevPrev > prev && prev < current && current > prevPrev && (current - prev) > 2) {
      anomalies.push({
        anomaly_type: 'ror_flick',
        severity: 'warning',
        description: `Unstable RoR: spike from ${prev.toFixed(1)}°C/min to ${current.toFixed(1)}°C/min`,
        suggested_action: 'Adjust airflow smoothly. Check for chaff or bean movement.',
        ai_generated: false
      });
    }

    return anomalies;
  }

  /**
   * Mark an event (first crack, second crack, drop, etc.)
   */
  markEvent(eventType, temperature, description = '') {
    this.events.push({
      type: eventType,
      temperature: Math.round(temperature),
      elapsed_seconds: this.dataPoints.length > 0
        ? this.dataPoints[this.dataPoints.length - 1].elapsed_seconds
        : 0,
      description,
      timestamp: new Date().toISOString()
    });

    if (eventType === 'first_crack') {
      this.firstCrackTime = this.dataPoints[this.dataPoints.length - 1].elapsed_seconds;
      this.firstCrackTemp = temperature;
    } else if (eventType === 'second_crack') {
      this.secondCrackTime = this.dataPoints[this.dataPoints.length - 1].elapsed_seconds;
    } else if (eventType === 'drop') {
      this.dropTime = this.dataPoints[this.dataPoints.length - 1].elapsed_seconds;
      this.dropTemp = temperature;
    }
  }

  /**
   * Calculate comprehensive roast metrics
   */
  calculateMetrics() {
    const totalSeconds = this.dataPoints.length > 0
      ? this.dataPoints[this.dataPoints.length - 1].elapsed_seconds
      : 0;

    const developmentSeconds = this.firstCrackTime && this.dropTime
      ? this.dropTime - this.firstCrackTime
      : 0;

    const developmentRatio = this.firstCrackTime && totalSeconds
      ? (developmentSeconds / totalSeconds) * 100
      : 0;

    return {
      total_roast_time_seconds: totalSeconds,
      total_roast_time_formatted: `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, '0')}`,
      first_crack_time_seconds: this.firstCrackTime,
      first_crack_temp_celsius: this.firstCrackTemp,
      development_time_seconds: developmentSeconds,
      development_ratio_percent: developmentRatio.toFixed(1),
      drop_time_seconds: this.dropTime,
      drop_temp_celsius: this.dropTemp,
      avg_ror: this.avgRoR.toFixed(2),
      peak_ror: this.maxRoR.toFixed(2),
      min_ror: this.minRoR === 999 ? 0 : this.minRoR.toFixed(2),
      weight_loss_percent: this.weightLoss.toFixed(1),
      current_phase: this.currentPhase,
      anomaly_count: this.anomalies.length,
      critical_anomalies: this.anomalies.filter(a => a.severity === 'critical').length,
      warning_anomalies: this.anomalies.filter(a => a.severity === 'warning').length
    };
  }

  /**
   * Get recent data for AI analysis (last 5 readings)
   */
  getRecentData() {
    return this.dataPoints.slice(-5).map(p => ({
      elapsed: p.elapsed_seconds,
      bean_temp: p.bean_temp_1,
      ror: p.ror_bt,
      power: p.power_pct,
      airflow: p.airflow_pct
    }));
  }

  /**
   * Get current state for WebSocket broadcast
   */
  getStateSnapshot() {
    const metrics = this.calculateMetrics();
    return {
      roast_id: this.roastId,
      ...metrics,
      current_data: this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1] : null,
      recent_history: this.getRecentData(),
      phase_transitions: this.phaseTransitions,
      events: this.events,
      anomalies: this.anomalies.slice(-10) // Last 10 anomalies
    };
  }
}

export default RoastMonitor;
