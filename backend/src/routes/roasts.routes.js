import express from 'express';
import {
  listRoasts,
  getRoast,
  createRoast,
  startRoast,
  stopRoast,
  recordDataPoint,
  recordEvent,
  analyzeRoast,
  updateRoast,
  deleteRoast
} from '../controllers/roasts.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, listRoasts);
router.post('/', authenticateToken, createRoast);
router.get('/:id', authenticateToken, getRoast);
router.put('/:id', authenticateToken, updateRoast);
router.delete('/:id', authenticateToken, deleteRoast);
router.post('/:id/start', authenticateToken, startRoast);
router.post('/:id/stop', authenticateToken, stopRoast);
router.post('/:id/data-point', authenticateToken, recordDataPoint);
router.post('/:id/event', authenticateToken, recordEvent);
router.post('/:id/analyze', authenticateToken, analyzeRoast);

export default router;
