import db from '../config/database.js';

export const getDashboardData = async (userId) => {
  const recentRoasts = await db('roasts')
    .select('*')
    .where('user_id', userId)
    .orderBy('start_time', 'desc')
    .limit(10);

  const totalRoasts = await db('roasts')
    .count('* as count')
    .where('user_id', userId)
    .first();

  const completedRoasts = await db('roasts')
    .count('* as count')
    .where('user_id', userId)
    .andWhere('status', 'completed')
    .first();

  const failedRoasts = await db('roasts')
    .count('* as count')
    .where('user_id', userId)
    .andWhere('status', 'failed')
    .first();

  const avgDevelopmentTime = await db('roasts')
    .avg('development_pct as avg_dev')
    .where('user_id', userId)
    .andWhere('status', 'completed')
    .first();

  const coffeeInventory = await db('green_coffees')
    .select('id', 'name', 'origin_country', 'quantity_kg')
    .where('user_id', userId);

  const recentAnomalies = await db('anomaly_logs')
    .select('*')
    .whereIn('roast_id', db('roasts').select('id').where('user_id', userId))
    .orderBy('created_at', 'desc')
    .limit(5);

  return {
    totalRoasts: totalRoasts?.count || 0,
    completedRoasts: completedRoasts?.count || 0,
    failedRoasts: failedRoasts?.count || 0,
    successRate: totalRoasts?.count > 0 ?
      ((completedRoasts?.count || 0) / totalRoasts.count * 100).toFixed(1) : 0,
    avgDevelopmentPct: (avgDevelopmentTime?.avg_dev || 0).toFixed(1),
    recentRoasts: recentRoasts.map(r => ({
      id: r.id,
      status: r.status,
      start_time: r.start_time,
      total_duration: r.total_duration,
      development_pct: r.development_pct,
      final_color: r.final_color
    })),
    coffeeInventory: coffeeInventory.map(c => ({
      id: c.id,
      name: c.name,
      origin: c.origin_country,
      quantity: c.quantity_kg
    })),
    recentAnomalies: recentAnomalies.map(a => ({
      id: a.id,
      roast_id: a.roast_id,
      type: a.anomaly_type,
      severity: a.severity,
      created_at: a.created_at
    }))
  };
};

export const getRoastTrends = async (userId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const roasts = await db('roasts')
    .select('*')
    .where('user_id', userId)
    .andWhere('status', 'completed')
    .andWhere('start_time', '>=', startDate)
    .orderBy('start_time', 'asc');

  const trends = {
    timeline: [],
    developmentTrend: [],
    temperatureTrend: [],
    weightLossTrend: [],
    averageRoastDuration: 0,
    consistencyScore: 0
  };

  if (roasts.length === 0) {
    return trends;
  }

  const durations = roasts.map(r => r.total_duration);
  trends.averageRoastDuration = (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(0);

  const devTimePcts = roasts.map(r => r.development_pct).filter(d => d !== null);
  const devAvg = devTimePcts.length > 0 ? devTimePcts.reduce((a, b) => a + b, 0) / devTimePcts.length : 0;
  const devStdDev = devTimePcts.length > 1 ? calculateStdDev(devTimePcts, devAvg) : 0;
  trends.consistencyScore = Math.max(0, 100 - (devStdDev * 5));

  const groupedByDate = {};
  for (const roast of roasts) {
    const dateKey = new Date(roast.start_time).toISOString().split('T')[0];
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(roast);
  }

  for (const [date, dayRoasts] of Object.entries(groupedByDate)) {
    const avgDev = dayRoasts.reduce((sum, r) => sum + (r.development_pct || 0), 0) / dayRoasts.length;
    const avgTemp = dayRoasts.reduce((sum, r) => sum + (r.charge_temp || 0), 0) / dayRoasts.length;
    const avgLoss = dayRoasts.reduce((sum, r) => sum + (r.weight_loss_pct || 0), 0) / dayRoasts.length;

    trends.timeline.push({ date, roast_count: dayRoasts.length });
    trends.developmentTrend.push({ date, value: avgDev.toFixed(1) });
    trends.temperatureTrend.push({ date, value: avgTemp.toFixed(1) });
    trends.weightLossTrend.push({ date, value: avgLoss.toFixed(1) });
  }

  return trends;
};

export const getComparativeAnalysis = async (userId, coffeeIds = null, days = 90) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let query = db('roasts')
    .select('roasts.*', 'gc.name as coffee_name', 'gc.origin_country')
    .leftJoin('green_coffees as gc', 'roasts.green_coffee_id', 'gc.id')
    .where('roasts.user_id', userId)
    .andWhere('roasts.start_time', '>=', startDate)
    .andWhere('roasts.status', 'completed');

  if (coffeeIds && coffeeIds.length > 0) {
    query = query.whereIn('roasts.green_coffee_id', coffeeIds);
  }

  const roasts = await query;

  if (roasts.length === 0) {
    return { roasts: [], analysis: null };
  }

  const groupedByCoffee = {};
  for (const roast of roasts) {
    const coffeeKey = roast.coffee_name || 'Unknown';
    if (!groupedByCoffee[coffeeKey]) {
      groupedByCoffee[coffeeKey] = [];
    }
    groupedByCoffee[coffeeKey].push(roast);
  }

  const comparison = {};
  for (const [coffeeType, coffeeRoasts] of Object.entries(groupedByCoffee)) {
    const developments = coffeeRoasts.map(r => r.development_pct).filter(d => d !== null);
    const temps = coffeeRoasts.map(r => r.charge_temp).filter(t => t !== null);
    const losses = coffeeRoasts.map(r => r.weight_loss_pct).filter(l => l !== null);

    comparison[coffeeType] = {
      roast_count: coffeeRoasts.length,
      avg_development: (developments.reduce((a, b) => a + b, 0) / developments.length).toFixed(1),
      avg_charge_temp: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
      avg_weight_loss: (losses.reduce((a, b) => a + b, 0) / losses.length).toFixed(1),
      development_consistency: calculateStdDev(developments, developments.reduce((a, b) => a + b, 0) / developments.length).toFixed(2),
      optimal_development: findPercentile(developments, 0.75).toFixed(1),
      improvement_trend: calculateTrend(developments)
    };
  }

  return {
    analysis_period_days: days,
    coffees_analyzed: Object.keys(comparison).length,
    total_roasts_analyzed: roasts.length,
    comparison
  };
};

const calculateStdDev = (values, mean) => {
  if (values.length < 2) return 0;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b) / values.length;
  return Math.sqrt(avgSquaredDiff);
};

const findPercentile = (values, percentile) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * percentile) - 1;
  return sorted[Math.max(0, index)];
};

const calculateTrend = (values) => {
  if (values.length < 2) return 'insufficient_data';
  const recent = values.slice(-Math.ceil(values.length / 2));
  const older = values.slice(0, Math.floor(values.length / 2));

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

  const diff = recentAvg - olderAvg;
  if (Math.abs(diff) < 0.5) return 'stable';
  return diff > 0 ? 'improving' : 'declining';
};
