/**
 * MIGRATION: 012_create_roast_phases_table.js
 * Creates roast_phases table to track actual phase execution and metrics
 */

export async function up(knex) {
  return knex.schema.createTable('roast_phases', (table) => {
    // Identity
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('roast_id').notNullable().references('id').inTable('roasts').onDelete('CASCADE');

    // Phase identity
    table.string('phase_name', 50).notNullable().comment('drying, yellowing, maillard, first_crack, development');
    table.integer('phase_order').notNullable().comment('Execution order: 1-5');

    // Timing
    table.integer('start_time_seconds').nullable();
    table.integer('end_time_seconds').nullable();
    table.integer('duration_seconds').nullable();

    // Temperature progression
    table.decimal('start_temp_bt', 5, 1).nullable().comment('Bean temp at phase start');
    table.decimal('end_temp_bt', 5, 1).nullable().comment('Bean temp at phase end');

    // Control parameters during phase
    table.decimal('avg_power_pct', 5, 1).nullable();
    table.decimal('avg_airflow_pct', 5, 1).nullable();
    table.decimal('avg_rpm', 5, 1).nullable();

    // RoR metrics within phase
    table.decimal('avg_ror', 5, 2).nullable();
    table.decimal('peak_ror', 5, 2).nullable();
    table.decimal('min_ror', 5, 2).nullable();
    table.string('ror_trend', 20).nullable().comment('declining, stable, increasing, erratic');

    // Quality metrics
    table.integer('anomaly_count').defaultTo(0);
    table.text('notes').nullable();

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes for performance
    table.index('roast_id');
    table.index('phase_name');
  });
}

export async function down(knex) {
  return knex.schema.dropTable('roast_phases');
}
