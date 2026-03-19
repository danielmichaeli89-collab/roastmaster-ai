/**
 * MIGRATION: 011_expand_roasts_table.js
 * Expands roasts table with advanced roasting metrics and AI integration.
 * Uses IF NOT EXISTS for safe re-runs.
 */

export async function up(knex) {
  const columns = [
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS roast_mode VARCHAR(30)",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS counterflow_used BOOLEAN DEFAULT false",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS yellowing_time_seconds INTEGER",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS yellowing_temp DECIMAL(5,1)",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS second_crack_time_seconds INTEGER",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS second_crack_temp DECIMAL(5,1)",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS peak_ror DECIMAL(5,2)",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS min_ror DECIMAL(5,2)",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS avg_ror DECIMAL(5,2)",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS ror_crashes_count INTEGER DEFAULT 0",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS ror_flicks_count INTEGER DEFAULT 0",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS ror_stalls_count INTEGER DEFAULT 0",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS ror_smoothness_score DECIMAL(5,2)",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS energy_consumption_wh DECIMAL(8,2)",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS ambient_temp_celsius DECIMAL(4,1)",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS ambient_humidity_percent DECIMAL(4,1)",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS roast_color_agtron INTEGER",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS ai_profile_used BOOLEAN DEFAULT false",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS ai_recommendations_followed INTEGER DEFAULT 0",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS ai_recommendations_ignored INTEGER DEFAULT 0",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS roaster_notes TEXT",
    "ALTER TABLE roasts ADD COLUMN IF NOT EXISTS quality_rating INTEGER",
  ];

  for (const sql of columns) {
    await knex.raw(sql);
  }
}

export async function down(knex) {
  const cols = [
    'roast_mode', 'counterflow_used', 'yellowing_time_seconds', 'yellowing_temp',
    'second_crack_time_seconds', 'second_crack_temp', 'peak_ror', 'min_ror', 'avg_ror',
    'ror_crashes_count', 'ror_flicks_count', 'ror_stalls_count', 'ror_smoothness_score',
    'energy_consumption_wh', 'ambient_temp_celsius', 'ambient_humidity_percent',
    'roast_color_agtron', 'ai_profile_used', 'ai_recommendations_followed',
    'ai_recommendations_ignored', 'roaster_notes', 'quality_rating'
  ];

  for (const col of cols) {
    await knex.raw(`ALTER TABLE roasts DROP COLUMN IF EXISTS ${col}`);
  }
}
