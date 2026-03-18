import express from 'express';
import {
  getDashboard,
  getTrends,
  getComparison
} from '../controllers/analytics.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', authenticateToken, getDashboard);
router.get('/trends', authenticateToken, getTrends);
router.get('/comparison', authenticateToken, getComparison);

export default router;
