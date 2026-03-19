import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { generateRoastProfile } from '../services/ai.service.js';

export const listProfiles = async (req, res) => {
  try {
    const profiles = await db('roast_profiles')
      .select('*')
      .where('user_id', req.user.id)
      .orderBy('created_at', 'desc');

    return res.json(profiles);
  } catch (error) {
    console.error('List profiles error:', error);
    return res.status(500).json({ error: 'Failed to fetch profiles' });
  }
};

export const getProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const profile = await db('roast_profiles')
      .where('id', id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const roastCount = await db('roasts')
      .count('* as count')
      .where('profile_id', id)
      .first();

    return res.json({
      ...profile,
      phases: typeof profile.phases === 'string' ? JSON.parse(profile.phases) : profile.phases,
      roast_count: roastCount?.count || 0
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const createProfile = async (req, res) => {
  const {
    name,
    coffee_type,
    target_flavor,
    charge_temp,
    phases,
    total_duration_target,
    development_time_pct,
    notes
  } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Profile name required' });
  }

  if (!phases || !Array.isArray(phases) || phases.length === 0) {
    return res.status(400).json({ error: 'Roast phases required' });
  }

  try {
    const profileId = uuidv4();

    const profileData = {
      id: profileId,
      user_id: req.user.id,
      name: name.trim(),
      coffee_type: coffee_type || null,
      target_flavor: target_flavor || null,
      charge_temp: charge_temp ? parseFloat(charge_temp) : null,
      phases: JSON.stringify(phases),
      total_duration_target: total_duration_target ? parseInt(total_duration_target) : null,
      development_time_pct: development_time_pct ? parseFloat(development_time_pct) : null,
      ai_generated: false,
      notes: notes || null
    };

    await db('roast_profiles').insert(profileData);

    const profile = await db('roast_profiles').where('id', profileId).first();

    return res.status(201).json({
      ...profile,
      phases: JSON.parse(profile.phases)
    });
  } catch (error) {
    console.error('Create profile error:', error);
    return res.status(500).json({ error: 'Failed to create profile' });
  }
};

export const updateProfile = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const profile = await db('roast_profiles')
      .where('id', id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (updates.phases && typeof updates.phases === 'object') {
      updates.phases = JSON.stringify(updates.phases);
    }

    await db('roast_profiles')
      .where('id', id)
      .update(updates);

    const updated = await db('roast_profiles').where('id', id).first();

    return res.json({
      ...updated,
      phases: JSON.parse(updated.phases)
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const deleteProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const profile = await db('roast_profiles')
      .where('id', id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const roastCount = await db('roasts')
      .count('* as count')
      .where('profile_id', id)
      .first();

    if (roastCount?.count > 0) {
      return res.status(400).json({
        error: 'Cannot delete profile with existing roasts'
      });
    }

    await db('roast_profiles').where('id', id).delete();

    return res.json({ message: 'Profile deleted' });
  } catch (error) {
    console.error('Delete profile error:', error);
    return res.status(500).json({ error: 'Failed to delete profile' });
  }
};

export const generateProfileAI = async (req, res) => {
  const { green_coffee_id, target_flavor } = req.body;

  if (!green_coffee_id) {
    return res.status(400).json({ error: 'Green coffee ID required' });
  }

  try {
    const coffee = await db('green_coffees')
      .where('id', green_coffee_id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!coffee) {
      return res.status(404).json({ error: 'Coffee not found' });
    }

    const aiProfile = await generateRoastProfile(coffee, target_flavor);

    if (aiProfile.error) {
      return res.status(500).json({ error: aiProfile.error });
    }

    const profileId = uuidv4();
    const profileName = `${coffee.name} - ${target_flavor || 'AI Generated'}`;

    await db('roast_profiles').insert({
      id: profileId,
      user_id: req.user.id,
      name: profileName,
      coffee_type: `${coffee.origin_country} - ${coffee.variety}`,
      target_flavor: target_flavor || 'Balanced',
      charge_temp: aiProfile.charge_temp,
      phases: JSON.stringify(aiProfile.phases),
      total_duration_target: aiProfile.total_duration_target,
      development_time_pct: aiProfile.development_time_pct,
      ai_generated: true,
      ai_reasoning: aiProfile.reasoning
    });

    const profile = await db('roast_profiles').where('id', profileId).first();

    return res.status(201).json({
      ...profile,
      phases: JSON.parse(profile.phases)
    });
  } catch (error) {
    console.error('Generate AI profile error:', error);
    return res.status(500).json({ error: 'Failed to generate profile' });
  }
};
