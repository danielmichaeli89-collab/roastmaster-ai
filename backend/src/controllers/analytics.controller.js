import {
  getDashboardData,
  getRoastTrends,
  getComparativeAnalysis
} from '../services/analytics.service.js';

export const getDashboard = async (req, res) => {
  try {
    const dashboard = await getDashboardData(req.user.id);
    return res.json(dashboard);
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
};

export const getTrends = async (req, res) => {
  const { days = 30 } = req.query;

  try {
    const trends = await getRoastTrends(req.user.id, parseInt(days));
    return res.json(trends);
  } catch (error) {
    console.error('Trends error:', error);
    return res.status(500).json({ error: 'Failed to fetch trends' });
  }
};

export const getComparison = async (req, res) => {
  const { coffee_ids, days = 90 } = req.query;

  try {
    const coffeeIds = coffee_ids ? coffee_ids.split(',') : null;
    const analysis = await getComparativeAnalysis(
      req.user.id,
      coffeeIds,
      parseInt(days)
    );

    return res.json(analysis);
  } catch (error) {
    console.error('Comparison error:', error);
    return res.status(500).json({ error: 'Failed to fetch comparison' });
  }
};
