export async function up(knex) {
  return knex.schema.createTable('green_coffees', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.string('name', 255).notNullable();
    table.string('origin_country', 100);
    table.string('region', 255);
    table.string('farm', 255);
    table.string('variety', 255);
    table.string('processing_method', 100);
    table.integer('altitude');
    table.decimal('moisture_content', 5, 2);
    table.decimal('density', 5, 2);
    table.integer('screen_size');
    table.integer('harvest_year');
    table.text('flavor_notes');
    table.decimal('quantity_kg', 10, 2);
    table.text('notes');
    table.timestamps(true, true);
    table.index('user_id');
  });
}

export async function down(knex) {
  return knex.schema.dropTable('green_coffees');
}
