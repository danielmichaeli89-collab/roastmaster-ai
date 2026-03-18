import express from 'express';
import {
  analyzeRoast,
  generateProfile,
  checkRealtime,
  compareRoasts,
  getInsights
} from '../controllers/ai.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * AI Decision Engine Routes
 *
 * All routes require authentication via JWT token
 */

// Profile generation
router.post('/generate-profile', authenticateToken, generateProfile);

// Real-time monitoring (called every 10 seconds during roast)
router.post('/realtime-check', authenticateToken, checkRealtime);

// Post-roast analysis
router.post('/analyze-roast', authenticateToken, analyzeRoast);

// Comparative analysis and insights
router.post('/insights', authenticateToken, getInsights);
router.post('/compare-roasts', authenticateToken, compareRoasts);

export default router;
