/**
 * MIGRATION: 012_create_roast_phases_table.js
 * Creates roast_phases table to track actual phase execution and metrics
 */

export async function up(knex) {
  const exists = await knex.schema.hasTable('roast_phases');
  if (exists) return;

  return knex.schema.createTable('roast_phases', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('roast_id').notNullable().references('id').inTable('roasts').onDelete('CASCADE');
    table.string('phase_name', 50).notNullable();
    table.integer('phase_order').notNullable();
    table.integer('start_time_seconds').nullable();
    table.integer('end_time_seconds').nullable();
    table.integer('duration_seconds').nullable();
    table.decimal('start_temp_bt', 5, 1).nullable();
    table.decimal('end_temp_bt', 5, 1).nullable();
    table.decimal('avg_power_pct', 5, 1).nullable();
    table.decimal('avg_airflow_pct', 5, 1).nullable();
    table.decimal('avg_rpm', 5, 1).nullable();
    table.decimal('avg_ror', 5, 2).nullable();
    table.decimal('peak_ror', 5, 2).nullable();
    table.decimal('min_ror', 5, 2).nullable();
    table.string('ror_trend', 20).nullable();
    table.integer('anomaly_count').defaultTo(0);
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('roast_id');
    table.index('phase_name');
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('roast_phases');
}
