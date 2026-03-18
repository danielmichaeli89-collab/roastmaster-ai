export async function up(knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('name', 255);
    table.enum('role', ['admin', 'roaster', 'viewer']).defaultTo('roaster');
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable('users');
}
