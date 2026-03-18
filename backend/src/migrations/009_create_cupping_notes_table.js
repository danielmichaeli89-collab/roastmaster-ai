export async function up(knex) {
  return knex.schema.createTable('cupping_notes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('roast_id').notNullable().references('id').inTable('roasts').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.decimal('fragrance', 3, 1);
    table.decimal('aroma', 3, 1);
    table.decimal('acidity', 3, 1);
    table.decimal('body', 3, 1);
    table.decimal('sweetness', 3, 1);
    table.decimal('aftertaste', 3, 1);
    table.decimal('balance', 3, 1);
    table.decimal('overall', 3, 1);
    table.decimal('total_score', 4, 2);
    table.jsonb('flavor_descriptors');
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('roast_id');
    table.index('user_id');
  });
}

export async function down(knex) {
  return knex.schema.dropTable('cupping_notes');
}
