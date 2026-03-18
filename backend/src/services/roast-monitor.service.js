export class RoastMonitor {
  constructor() {
    this.temperatureHistory = [];
    this.rorHistory = [];
    this.anomalies = [];
  }

  recordDataPoint(dataPoint) {
    this.temperatureHistory.push({
      timestamp: dataPoint.timestamp,
      elapsed_seconds: dataPoint.elapsed_seconds,
      bean_temp: dataPoint.bean_temp_1,
      ror_bt: dataPoint.ror_bt
    });

    if (this.rorHistory.length > 0) {
      this.rorHistory.push(dataPoint.ror_bt);
      if (this.rorHistory.length > 120) {
        this.rorHistory.shift();
      }
    } else {
      this.rorHistory.push(dataPoint.ror_bt);
    }
  }

  detectAnomalies(dataPoint, profileTarget) {
    const detected = [];

    if (this.temperatureHistory.length < 2) {
      return detected;
    }

    const prevPoint = this.temperatureHistory[this.temperatureHistory.length - 2];
    const currentTemp = dataPoint.bean_temp_1;
    const prevTemp = prevPoint.bean_temp;
    const timeDiff = (dataPoint.elapsed_seconds - prevPoint.elapsed_seconds) || 1;

    const currentRor = (currentTemp - prevTemp) / (timeDiff / 60);

    detected.push(...this.checkRorCrash(currentRor, dataPoint));
    detected.push(...this.checkStalling(currentRor, dataPoint));
    detected.push(...this.checkTemperatureDeviation(currentTemp, profileTarget, dataPoint));
    detected.push(...this.checkDevelopmentConcerns(dataPoint, profileTarget));
    detected.push(...this.checkDrumPressure(dataPoint));

    return detected;
  }

  checkRorCrash(currentRor, dataPoint) {
    const anomalies = [];

    if (this.rorHistory.length < 3) return anomalies;

    const avgRor = this.rorHistory.reduce((a, b) => a + b, 0) / this.rorHistory.length;
    const rorDrop = avgRor - currentRor;

    if (rorDrop > 2 && currentRor > 0.5) {
      anomalies.push({
        anomaly_type: 'ror_crash',
        severity: 'warning',
        description: `Rate of Rise crashed by ${rorDrop.toFixed(1)}°C/min (from ${avgRor.toFixed(1)} to ${currentRor.toFixed(1)})`,
        suggested_action: 'Increase power slightly or reduce airflow to recover RoR. Watch for stalling.',
        ai_generated: false
      });
    }

    return anomalies;
  }

  checkStalling(currentRor, dataPoint) {
    const anomalies = [];

    if (currentRor < 0.2 && dataPoint.elapsed_seconds > 60) {
      anomalies.push({
        anomaly_type: 'stalling',
        severity: 'critical',
        description: `Stalling detected: RoR has dropped to ${currentRor.toFixed(2)}°C/min`,
        suggested_action: 'Immediately increase power by 10-15% or reduce airflow to restart development',
        ai_generated: false
      });
    } else if (currentRor < 0.5 && dataPoint.elapsed_seconds > 60) {
      anomalies.push({
        anomaly_type: 'stalling_risk',
        severity: 'warning',
        description: `Low RoR: ${currentRor.toFixed(2)}°C/min - risk of stalling`,
        suggested_action: 'Monitor RoR closely. Consider gentle power increase if it continues to drop.',
        ai_generated: false
      });
    }

    return anomalies;
  }

  checkTemperatureDeviation(currentTemp, profileTarget, dataPoint) {
    const anomalies = [];

    if (!profileTarget || !profileTarget.target_temp) {
      return anomalies;
    }

    const deviation = currentTemp - profileTarget.target_temp;

    if (Math.abs(deviation) > 10) {
      const direction = deviation > 0 ? 'above' : 'below';
      anomalies.push({
        anomaly_type: 'temperature_deviation_critical',
        severity: 'critical',
        description: `Temperature ${Math.abs(deviation).toFixed(1)}°C ${direction} target (${currentTemp.toFixed(1)}°C vs ${profileTarget.target_temp}°C)`,
        suggested_action: deviation > 0 ? 'Reduce power to cool down' : 'Increase power to warm up',
        ai_generated: false
      });
    } else if (Math.abs(deviation) > 5) {
      const direction = deviation > 0 ? 'above' : 'below';
      anomalies.push({
        anomaly_type: 'temperature_deviation',
        severity: 'warning',
        description: `Temperature ${Math.abs(deviation).toFixed(1)}°C ${direction} target`,
        suggested_action: deviation > 0 ? 'Slight power reduction' : 'Slight power increase',
        ai_generated: false
      });
    }

    return anomalies;
  }

  checkDevelopmentConcerns(dataPoint, profileTarget) {
    const anomalies = [];

    if (!profileTarget || !profileTarget.first_crack_time) {
      return anomalies;
    }

    const timeAfterFC = dataPoint.elapsed_seconds - profileTarget.first_crack_time;
    const totalTargetDev = profileTarget.development_time_target || 120;

    if (timeAfterFC > 0 && timeAfterFC / totalTargetDev > 1.25) {
      anomalies.push({
        anomaly_type: 'over_development',
        severity: 'warning',
        description: `Development has exceeded target by ${((timeAfterFC / totalTargetDev - 1) * 100).toFixed(0)}%`,
        suggested_action: 'Consider dropping soon to avoid over-development and bitter notes',
        ai_generated: false
      });
    }

    return anomalies;
  }

  checkDrumPressure(dataPoint) {
    const anomalies = [];

    if (!dataPoint.drum_pressure) {
      return anomalies;
    }

    if (dataPoint.drum_pressure < 0.3) {
      anomalies.push({
        anomaly_type: 'low_drum_pressure',
        severity: 'warning',
        description: `Drum pressure very low: ${dataPoint.drum_pressure.toFixed(3)} bar`,
        suggested_action: 'Check motor and mechanical condition. Pressure should be 0.5-1.0 bar.',
        ai_generated: false
      });
    } else if (dataPoint.drum_pressure > 1.5) {
      anomalies.push({
        anomaly_type: 'high_drum_pressure',
        severity: 'warning',
        description: `Drum pressure high: ${dataPoint.drum_pressure.toFixed(3)} bar`,
        suggested_action: 'Verify proper loading and roaster condition. May indicate airflow obstruction.',
        ai_generated: false
      });
    }

    return anomalies;
  }

  calculateRoastMetrics(roastData) {
    return {
      avg_ror: this.rorHistory.length > 0 ? (this.rorHistory.reduce((a, b) => a + b, 0) / this.rorHistory.length).toFixed(2) : 0,
      peak_ror: this.rorHistory.length > 0 ? Math.max(...this.rorHistory).toFixed(2) : 0,
      min_ror: this.rorHistory.length > 0 ? Math.min(...this.rorHistory).toFixed(2) : 0,
      total_anomalies: this.anomalies.length,
      critical_count: this.anomalies.filter(a => a.severity === 'critical').length
    };
  }
}

export default RoastMonitor;
