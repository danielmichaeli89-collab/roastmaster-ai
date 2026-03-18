/**
 * MIGRATION: 011_expand_roasts_table.js
 * Expands roasts table with advanced roasting metrics and AI integration
 */

export async function up(knex) {
  return knex.schema.alterTable('roasts', (table) => {
    // Roast mode and counterflow
    table.string('roast_mode', 30).nullable().comment('automatic, manual_power, manual_et, counterflow');
    table.boolean('counterflow_used').defaultTo(false);

    // Key phase timings and temperatures
    table.integer('yellowing_time_seconds').nullable();
    table.decimal('yellowing_temp', 5, 1).nullable();
    table.integer('second_crack_time_seconds').nullable();
    table.decimal('second_crack_temp', 5, 1).nullable();

    // RoR metrics
    table.decimal('peak_ror', 5, 2).nullable();
    table.decimal('min_ror', 5, 2).nullable();
    table.decimal('avg_ror', 5, 2).nullable();

    // RoR defect tracking
    table.integer('ror_crashes_count').defaultTo(0).comment('Sudden drops > 3°C/min');
    table.integer('ror_flicks_count').defaultTo(0).comment('Unstable spikes');
    table.integer('ror_stalls_count').defaultTo(0).comment('RoR < 2°C/min before FC');
    table.decimal('ror_smoothness_score', 5, 2).nullable().comment('0-100 smoothness rating');

    // Energy efficiency
    table.decimal('energy_consumption_wh', 8, 2).nullable().comment('Estimated watt-hours used');

    // Environmental conditions during roast
    table.decimal('ambient_temp_celsius', 4, 1).nullable();
    table.decimal('ambient_humidity_percent', 4, 1).nullable();

    // Color analysis
    table.integer('roast_color_agtron').nullable().comment('Agtron color reading if available');

    // AI integration
    table.boolean('ai_profile_used').defaultTo(false);
    table.integer('ai_recommendations_followed').defaultTo(0);
    table.integer('ai_recommendations_ignored').defaultTo(0);

    // Operator notes and rating
    table.text('roaster_notes').nullable();
    table.integer('quality_rating').nullable().comment('1-100 overall quality from roaster');
  });
}

export async function down(knex) {
  return knex.schema.alterTable('roasts', (table) => {
    table.dropColumn('roast_mode');
    table.dropColumn('counterflow_used');
    table.dropColumn('yellowing_time_seconds');
    table.dropColumn('yellowing_temp');
    table.dropColumn('second_crack_time_seconds');
    table.dropColumn('second_crack_temp');
    table.dropColumn('peak_ror');
    table.dropColumn('min_ror');
    table.dropColumn('avg_ror');
    table.dropColumn('ror_crashes_count');
    table.dropColumn('ror_flicks_count');
    table.dropColumn('ror_stalls_count');
    table.dropColumn('ror_smoothness_score');
    table.dropColumn('energy_consumption_wh');
    table.dropColumn('ambient_temp_celsius');
    table.dropColumn('ambient_humidity_percent');
    table.dropColumn('roast_color_agtron');
    table.dropColumn('ai_profile_used');
    table.dropColumn('ai_recommendations_followed');
    table.dropColumn('ai_recommendations_ignored');
    table.dropColumn('roaster_notes');
    table.dropColumn('quality_rating');
  });
}
