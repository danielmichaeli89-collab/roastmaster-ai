export async function up(knex) {
  return knex.schema.createTable('temperature_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('roast_id').notNullable().references('id').inTable('roasts').onDelete('CASCADE');
    table.timestamp('timestamp').notNullable();
    table.integer('elapsed_seconds').notNullable();
    table.decimal('bean_temp_1', 5, 2);
    table.decimal('bean_temp_2', 5, 2);
    table.decimal('air_temp', 5, 2);
    table.decimal('inlet_temp', 5, 2);
    table.decimal('drum_temp', 5, 2);
    table.decimal('exhaust_temp', 5, 2);
    table.decimal('drum_pressure', 6, 3);
    table.decimal('ror_bt', 5, 2);
    table.decimal('ror_et', 5, 2);
    table.decimal('power_pct', 5, 2);
    table.decimal('airflow_pct', 5, 2);
    table.integer('rpm');
    table.string('phase', 100);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('roast_id');
    table.index('timestamp');
  });
}

export async function down(knex) {
  return knex.schema.dropTable('temperature_logs');
}
