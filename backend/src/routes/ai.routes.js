import express from 'express';
import {
  analyzeRoast,
  generateProfile,
  checkRealTime,
  compareRoasts
} from '../controllers/ai.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/analyze-roast', authenticateToken, analyzeRoast);
router.post('/generate-profile', authenticateToken, generateProfile);
router.post('/real-time-check', authenticateToken, checkRealTime);
router.post('/compare-roasts', authenticateToken, compareRoasts);

export default router;
