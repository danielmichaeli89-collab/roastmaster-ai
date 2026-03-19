import {
  getDashboardData,
  getRoastTrends,
  getComparativeAnalysis
} from '../services/analytics.service.js';

export const getDashboard = async (req, res) => {
  try {
    const dashboard = await getDashboardData(req.user.id);
    return res.json(dashboard || {
      totalRoasts: 0,
      completedRoasts: 0,
      failedRoasts: 0,
      successRate: 0,
      avgDevelopmentPct: 0,
      recentRoasts: [],
      coffeeInventory: [],
      recentAnomalies: []
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
};

export const getTrends = async (req, res) => {
  const { days = 30 } = req.query;

  try {
    const parsedDays = Math.max(1, Math.min(365, parseInt(days) || 30));
    const trends = await getRoastTrends(req.user.id, parsedDays);
    return res.json(trends || {
      timeline: [],
      developmentTrend: [],
      temperatureTrend: [],
      weightLossTrend: [],
      averageRoastDuration: 0,
      consistencyScore: 0
    });
  } catch (error) {
    console.error('Trends error:', error);
    return res.status(500).json({ error: 'Failed to fetch trends' });
  }
};

export const getComparison = async (req, res) => {
  const { coffee_ids, days = 90 } = req.query;

  try {
    const coffeeIds = coffee_ids ? coffee_ids.split(',').filter(id => id.trim()) : null;
    const parsedDays = Math.max(1, Math.min(365, parseInt(days) || 90));
    const analysis = await getComparativeAnalysis(
      req.user.id,
      coffeeIds,
      parsedDays
    );

    return res.json(analysis || {
      analysis_period_days: parsedDays,
      coffees_analyzed: 0,
      total_roasts_analyzed: 0,
      comparison: {}
    });
  } catch (error) {
    console.error('Comparison error:', error);
    return res.status(500).json({ error: 'Failed to fetch comparison' });
  }
};
