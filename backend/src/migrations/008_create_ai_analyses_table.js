export async function up(knex) {
  return knex.schema.createTable('ai_analyses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('roast_id').notNullable().references('id').inTable('roasts').onDelete('CASCADE');
    table.enum('analysis_type', ['pre_roast', 'real_time', 'post_roast', 'comparative']).notNullable();
    table.jsonb('content');
    table.jsonb('recommendations');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('roast_id');
  });
}

export async function down(knex) {
  return knex.schema.dropTable('ai_analyses');
}
