import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateUserProfile,
  refreshToken,
  changePassword,
  logout
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, updateUserProfile);
router.post('/refresh', refreshToken);
router.post('/change-password', authenticateToken, changePassword);
router.post('/logout', authenticateToken, logout);

export default router;
