export async function up(knex) {
  return knex.schema.createTable('roasts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.uuid('profile_id').references('id').inTable('roast_profiles');
    table.uuid('green_coffee_id').references('id').inTable('green_coffees');
    table.enum('status', ['planned', 'in_progress', 'completed', 'failed']).defaultTo('planned');
    table.decimal('batch_weight_g', 10, 2);
    table.decimal('charge_temp', 5, 2);
    table.timestamp('start_time').notNullable();
    table.timestamp('end_time');
    table.timestamp('first_crack_time');
    table.timestamp('drop_time');
    table.integer('total_duration');
    table.integer('development_time');
    table.decimal('development_pct', 5, 2);
    table.decimal('weight_loss_pct', 5, 2);
    table.string('final_color', 50);
    table.text('notes');
    table.timestamps(true, true);
    table.index('user_id');
    table.index('profile_id');
    table.index('start_time');
  });
}

export async function down(knex) {
  return knex.schema.dropTable('roasts');
}
