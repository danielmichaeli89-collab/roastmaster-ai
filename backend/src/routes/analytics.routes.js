import express from 'express';
import {
  getDashboard,
  getTrends,
  getComparison
} from '../controllers/analytics.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Original routes
router.get('/dashboard', authenticateToken, getDashboard);
router.get('/trends', authenticateToken, getTrends);
router.get('/comparison', authenticateToken, getComparison);

// Aliases for frontend compatibility
router.get('/stats', authenticateToken, getDashboard);
router.get('/quality-trends', authenticateToken, getTrends);
router.get('/dev-time-vs-quality', authenticateToken, (req, res) => res.json([]));
router.get('/ror-analysis', authenticateToken, (req, res) => res.json([]));
router.get('/origin-analysis', authenticateToken, (req, res) => res.json([]));
router.get('/profile-performance', authenticateToken, (req, res) => res.json([]));
router.get('/roast-level-distribution', authenticateToken, (req, res) => res.json([]));
router.get('/success-rate-trends', authenticateToken, (req, res) => res.json([]));
router.get('/ai-insights', authenticateToken, (req, res) => res.json({ insights: 'Start roasting to generate AI insights! Add coffees to your inventory and create roast profiles to get started.' }));
router.get('/anomaly-frequency', authenticateToken, (req, res) => res.json([]));

export default router;
