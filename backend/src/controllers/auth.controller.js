import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';

export const register = async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const existing = await db('users').where('email', email).first();
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcryptjs.hash(password, 10);
    const userId = uuidv4();

    await db('users').insert({
      id: userId,
      email,
      password_hash: passwordHash,
      name: name || email.split('@')[0],
      role: 'roaster'
    });

    const token = jwt.sign(
      { id: userId, email, role: 'roaster' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      user: { id: userId, email, name: name || email.split('@')[0], role: 'roaster' },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const user = await db('users').where('email', email).first();

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcryptjs.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await db('users').where('id', req.user.id).first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await db('users').where('id', req.user.id).first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if new email is already taken (if changed)
    if (email && email !== user.email) {
      const existing = await db('users').where('email', email).first();
      if (existing) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    await db('users').where('id', req.user.id).update(updates);

    const updated = await db('users').where('id', req.user.id).first();

    return res.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};
