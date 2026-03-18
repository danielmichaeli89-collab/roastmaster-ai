import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';

export const listCoffees = async (req, res) => {
  try {
    const coffees = await db('green_coffees')
      .select('*')
      .where('user_id', req.user.id)
      .orderBy('created_at', 'desc');

    return res.json(coffees);
  } catch (error) {
    console.error('List coffees error:', error);
    return res.status(500).json({ error: 'Failed to fetch coffees' });
  }
};

export const getCoffee = async (req, res) => {
  const { id } = req.params;

  try {
    const coffee = await db('green_coffees')
      .where('id', id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!coffee) {
      return res.status(404).json({ error: 'Coffee not found' });
    }

    const roastCount = await db('roasts')
      .count('* as count')
      .where('green_coffee_id', id)
      .first();

    return res.json({
      ...coffee,
      roast_count: roastCount?.count || 0
    });
  } catch (error) {
    console.error('Get coffee error:', error);
    return res.status(500).json({ error: 'Failed to fetch coffee' });
  }
};

export const createCoffee = async (req, res) => {
  const {
    name,
    origin_country,
    region,
    farm,
    variety,
    processing_method,
    altitude,
    moisture_content,
    density,
    screen_size,
    harvest_year,
    flavor_notes,
    quantity_kg,
    notes
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Coffee name required' });
  }

  try {
    const coffeeId = uuidv4();

    await db('green_coffees').insert({
      id: coffeeId,
      user_id: req.user.id,
      name,
      origin_country,
      region,
      farm,
      variety,
      processing_method,
      altitude,
      moisture_content,
      density,
      screen_size,
      harvest_year,
      flavor_notes,
      quantity_kg,
      notes
    });

    const coffee = await db('green_coffees').where('id', coffeeId).first();

    return res.status(201).json(coffee);
  } catch (error) {
    console.error('Create coffee error:', error);
    return res.status(500).json({ error: 'Failed to create coffee' });
  }
};

export const updateCoffee = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const coffee = await db('green_coffees')
      .where('id', id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!coffee) {
      return res.status(404).json({ error: 'Coffee not found' });
    }

    await db('green_coffees')
      .where('id', id)
      .update(updates);

    const updated = await db('green_coffees').where('id', id).first();

    return res.json(updated);
  } catch (error) {
    console.error('Update coffee error:', error);
    return res.status(500).json({ error: 'Failed to update coffee' });
  }
};

export const deleteCoffee = async (req, res) => {
  const { id } = req.params;

  try {
    const coffee = await db('green_coffees')
      .where('id', id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!coffee) {
      return res.status(404).json({ error: 'Coffee not found' });
    }

    const roastCount = await db('roasts')
      .count('* as count')
      .where('green_coffee_id', id)
      .first();

    if (roastCount?.count > 0) {
      return res.status(400).json({
        error: 'Cannot delete coffee with existing roasts'
      });
    }

    await db('green_coffees').where('id', id).delete();

    return res.json({ message: 'Coffee deleted' });
  } catch (error) {
    console.error('Delete coffee error:', error);
    return res.status(500).json({ error: 'Failed to delete coffee' });
  }
};
