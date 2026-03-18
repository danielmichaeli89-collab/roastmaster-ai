import express from 'express';
import {
  listProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  generateProfileAI
} from '../controllers/profiles.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, listProfiles);
router.get('/:id', authenticateToken, getProfile);
router.post('/', authenticateToken, createProfile);
router.put('/:id', authenticateToken, updateProfile);
router.delete('/:id', authenticateToken, deleteProfile);
router.post('/generate', authenticateToken, generateProfileAI);

export default router;
