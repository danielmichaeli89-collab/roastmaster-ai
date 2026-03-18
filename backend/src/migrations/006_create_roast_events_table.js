export async function up(knex) {
  return knex.schema.createTable('roast_events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('roast_id').notNullable().references('id').inTable('roasts').onDelete('CASCADE');
    table.enum('event_type', ['first_crack', 'second_crack', 'yellowing', 'drop', 'anomaly', 'adjustment']).notNullable();
    table.integer('elapsed_seconds');
    table.decimal('temperature', 5, 2);
    table.text('description');
    table.boolean('auto_detected').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('roast_id');
  });
}

export async function down(knex) {
  return knex.schema.dropTable('roast_events');
}
