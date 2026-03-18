import express from 'express';
import {
  listCoffees,
  getCoffee,
  createCoffee,
  updateCoffee,
  deleteCoffee
} from '../controllers/coffees.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, listCoffees);
router.get('/:id', authenticateToken, getCoffee);
router.post('/', authenticateToken, createCoffee);
router.put('/:id', authenticateToken, updateCoffee);
router.delete('/:id', authenticateToken, deleteCoffee);

export default router;
