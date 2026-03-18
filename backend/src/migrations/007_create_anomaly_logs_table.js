export async function up(knex) {
  return knex.schema.createTable('anomaly_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('roast_id').notNullable().references('id').inTable('roasts').onDelete('CASCADE');
    table.integer('elapsed_seconds');
    table.string('anomaly_type', 100).notNullable();
    table.enum('severity', ['info', 'warning', 'critical']).notNullable();
    table.text('description');
    table.text('suggested_action');
    table.boolean('ai_generated').defaultTo(false);
    table.boolean('resolved').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('roast_id');
    table.index('severity');
  });
}

export async function down(knex) {
  return knex.schema.dropTable('anomaly_logs');
}
