export async function up(knex) {
  return knex.schema.createTable('roast_profiles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.string('name', 255).notNullable();
    table.string('coffee_type', 100);
    table.string('target_flavor', 255);
    table.decimal('charge_temp', 5, 2);
    table.jsonb('phases');
    table.integer('total_duration_target');
    table.decimal('development_time_pct', 5, 2);
    table.boolean('ai_generated').defaultTo(false);
    table.text('ai_reasoning');
    table.text('notes');
    table.timestamps(true, true);
    table.index('user_id');
  });
}

export async function down(knex) {
  return knex.schema.dropTable('roast_profiles');
}
