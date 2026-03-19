/**
 * MIGRATION: 010_expand_green_coffees_table.js
 * Expands green_coffees table with detailed sourcing, storage, and quality data.
 * Uses IF NOT EXISTS to safely handle columns that may already exist.
 */

export async function up(knex) {
  const columns = [
    { name: 'altitude_min', sql: 'ALTER TABLE green_coffees ADD COLUMN IF NOT EXISTS altitude_min INTEGER' },
    { name: 'altitude_max', sql: 'ALTER TABLE green_coffees ADD COLUMN IF NOT EXISTS altitude_max INTEGER' },
    { name: 'harvest_month', sql: 'ALTER TABLE green_coffees ADD COLUMN IF NOT EXISTS harvest_month VARCHAR(20)' },
    { name: 'crop_year', sql: 'ALTER TABLE green_coffees ADD COLUMN IF NOT EXISTS crop_year VARCHAR(10)' },
    { name: 'lot_number', sql: 'ALTER TABLE green_coffees ADD COLUMN IF NOT EXISTS lot_number VARCHAR(50)' },
    { name: 'bag_weight_kg', sql: 'ALTER TABLE green_coffees ADD COLUMN IF NOT EXISTS bag_weight_kg DECIMAL(6,2)' },
    { name: 'bags_purchased', sql: 'ALTER TABLE green_coffees ADD COLUMN IF NOT EXISTS bags_purchased INTEGER' },
    { name: 'bags_remaining', sql: 'ALTER TABLE green_coffees ADD COLUMN IF NOT EXISTS bags_remaining INTEGER' },
    { name: 'purchase_price_usd_per_kg', sql: 'ALTER TABLE green_coffees ADD COLUMN IF NOT EXISTS purchase_price_usd_per_kg DECIMAL(8,2)' },
    { name: 'supplier', sql: 'ALTER TABLE green_coffees ADD COLUMN IF NOT EXISTS supplier VARCHAR(100)' },
    { name: 'certifications', sql: 'ALTER TABLE green_coffees ADD COLUMN IF NOT EXISTS certifications TEXT' },
    { name: 'cupping_score_green', sql: 'ALTER TABLE green_coffees ADD COLUMN IF NOT EXISTS cupping_score_green DECIMAL(4,1)' },
    { name: 'tasting_notes_green', sql: 'ALTER TABLE green_coffees ADD COLUMN IF NOT EXISTS tasting_notes_green TEXT' },
    { name: 'water_activity', sql: 'ALTER TABLE green_coffees ADD COLUMN IF NOT EXISTS water_activity DECIMAL(4,3)' },
    { name: 'defect_count', sql: 'ALTER TABLE green_coffees ADD COLUMN IF NOT EXISTS defect_count INTEGER' },
    { name: 'status', sql: "ALTER TABLE green_coffees ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'" },
    { name: 'arrival_date', sql: 'ALTER TABLE green_coffees ADD COLUMN IF NOT EXISTS arrival_date DATE' },
    { name: 'best_before_date', sql: 'ALTER TABLE green_coffees ADD COLUMN IF NOT EXISTS best_before_date DATE' },
  ];

  for (const col of columns) {
    await knex.raw(col.sql);
  }
}

export async function down(knex) {
  const columnsToDrop = [
    'altitude_min', 'altitude_max', 'harvest_month', 'crop_year', 'lot_number',
    'bag_weight_kg', 'bags_purchased', 'bags_remaining', 'purchase_price_usd_per_kg',
    'supplier', 'certifications', 'cupping_score_green', 'tasting_notes_green',
    'water_activity', 'defect_count', 'status', 'arrival_date', 'best_before_date'
  ];

  for (const col of columnsToDrop) {
    await knex.raw(`ALTER TABLE green_coffees DROP COLUMN IF EXISTS ${col}`);
  }
}
