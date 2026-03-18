/**
 * MIGRATION: 010_expand_green_coffees_table.js
 * Expands green_coffees table with detailed sourcing, storage, and quality data
 */

export async function up(knex) {
  return knex.schema.alterTable('green_coffees', (table) => {
    // Altitude range (farms that span elevations)
    table.integer('altitude_min').nullable();
    table.integer('altitude_max').nullable();

    // Harvest tracking
    table.string('harvest_year', 10).nullable().comment('e.g. "2024/2025"');
    table.string('harvest_month', 20).nullable();
    table.string('crop_year', 10).nullable();
    table.string('lot_number', 50).nullable();

    // Inventory management
    table.decimal('bag_weight_kg', 6, 2).nullable();
    table.integer('bags_purchased').nullable();
    table.integer('bags_remaining').nullable();

    // Cost tracking
    table.decimal('purchase_price_usd_per_kg', 8, 2).nullable();

    // Sourcing details
    table.string('supplier', 100).nullable();
    table.text('certifications').nullable().comment('JSON array: organic, fair_trade, rainforest_alliance, etc.');

    // Pre-roast quality metrics
    table.decimal('cupping_score_green', 4, 1).nullable().comment('Green bean cupping score from importer');
    table.text('tasting_notes_green').nullable().comment('Flavor notes from importer/origin');

    // Storage conditions
    table.decimal('water_activity', 4, 3).nullable().comment('Aw value for storage/freshness');
    table.integer('defect_count').nullable().comment('Defects per 350g sample (SCA standard)');

    // Status and dates
    table.string('status', 20).defaultTo('active').comment('active, depleted, archived');
    table.date('arrival_date').nullable();
    table.date('best_before_date').nullable();
  });
}

export async function down(knex) {
  return knex.schema.alterTable('green_coffees', (table) => {
    table.dropColumn('altitude_min');
    table.dropColumn('altitude_max');
    table.dropColumn('harvest_year');
    table.dropColumn('harvest_month');
    table.dropColumn('crop_year');
    table.dropColumn('lot_number');
    table.dropColumn('bag_weight_kg');
    table.dropColumn('bags_purchased');
    table.dropColumn('bags_remaining');
    table.dropColumn('purchase_price_usd_per_kg');
    table.dropColumn('supplier');
    table.dropColumn('certifications');
    table.dropColumn('cupping_score_green');
    table.dropColumn('tasting_notes_green');
    table.dropColumn('water_activity');
    table.dropColumn('defect_count');
    table.dropColumn('status');
    table.dropColumn('arrival_date');
    table.dropColumn('best_before_date');
  });
}
