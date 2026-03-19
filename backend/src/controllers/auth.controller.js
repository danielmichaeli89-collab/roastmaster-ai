import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';

/**
 * Helper: Format user object with all expected fields
 */
const formatUser = (dbUser) => {
  return {
    id: dbUser.id,
    email: dbUser.email,
    username: dbUser.username || null,
    fullName: dbUser.full_name || null,
    role: dbUser.role || 'roaster',
    organizationName: dbUser.organization_name || null,
    roesterSerialNumber: dbUser.roester_serial_number || null,
    isActive: dbUser.is_active !== false,
    lastLoginAt: dbUser.last_login_at || null,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at
  };
};

/**
 * Helper: Generate access and refresh tokens
 */
const generateTokens = (userId, email, role) => {
  const accessToken = jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const refreshToken = jwt.sign(
    { id: userId, email, role, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken, expiresIn: 604800 }; // 7 days in seconds
};

export const register = async (req, res) => {
  const { email, password, username, fullName, organizationName, roesterSerialNumber } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  try {
    const existing = await db('users').where('email', email).first();
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const usernameExists = await db('users').where('username', username).first();
    if (usernameExists) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const passwordHash = await bcryptjs.hash(password, 10);
    const userId = uuidv4();
    const now = new Date();

    await db('users').insert({
      id: userId,
      email,
      username,
      password_hash: passwordHash,
      full_name: fullName || null,
      organization_name: organizationName || null,
      roester_serial_number: roesterSerialNumber || null,
      role: 'roaster',
      is_active: true,
      created_at: now,
      updated_at: now
    });

    const user = await db('users').where('id', userId).first();
    const { accessToken, refreshToken, expiresIn } = generateTokens(userId, email, 'roaster');

    return res.status(201).json({
      user: formatUser(user),
      token: {
        accessToken,
        refreshToken,
        expiresIn
      }
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

    // Update last login time
    await db('users').where('id', user.id).update({
      last_login_at: new Date(),
      updated_at: new Date()
    });

    const updatedUser = await db('users').where('id', user.id).first();
    const { accessToken, refreshToken, expiresIn } = generateTokens(user.id, user.email, user.role);

    return res.json({
      user: formatUser(updatedUser),
      token: {
        accessToken,
        refreshToken,
        expiresIn
      }
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

    return res.json(formatUser(user));
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { fullName, organizationName, roesterSerialNumber } = req.body;

    const user = await db('users').where('id', req.user.id).first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = { updated_at: new Date() };
    if (fullName !== undefined) updates.full_name = fullName;
    if (organizationName !== undefined) updates.organization_name = organizationName;
    if (roesterSerialNumber !== undefined) updates.roester_serial_number = roesterSerialNumber;

    if (Object.keys(updates).length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    await db('users').where('id', req.user.id).update(updates);

    const updated = await db('users').where('id', req.user.id).first();

    return res.json(formatUser(updated));
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    const user = await db('users').where('id', decoded.id).first();

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    const { accessToken, refreshToken: newRefreshToken, expiresIn } = generateTokens(
      user.id,
      user.email,
      user.role
    );

    return res.json({
      token: {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    const user = await db('users').where('id', req.user.id).first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcryptjs.compare(currentPassword, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const passwordHash = await bcryptjs.hash(newPassword, 10);

    await db('users').where('id', req.user.id).update({
      password_hash: passwordHash,
      updated_at: new Date()
    });

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Failed to change password' });
  }
};

export const logout = async (req, res) => {
  try {
    // Update last_login_at to track logout timestamp if desired
    await db('users').where('id', req.user.id).update({
      updated_at: new Date()
    });

    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Logout failed' });
  }
};
