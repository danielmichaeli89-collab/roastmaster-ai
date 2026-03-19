/**
 * MIGRATION: 013_create_roast_learning_table.js
 * Creates roast_learnings table for AI learning from historical roast→cupping correlations
 */

export async function up(knex) {
  const exists = await knex.schema.hasTable('roast_learnings');
  if (exists) return;

  return knex.schema.createTable('roast_learnings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('coffee_id').notNullable().references('id').inTable('green_coffees').onDelete('CASCADE');
    table.uuid('roast_id').notNullable().references('id').inTable('roasts').onDelete('CASCADE');
    table.uuid('cupping_id').nullable().references('id').inTable('cupping_notes').onDelete('SET NULL');
    table.string('learning_type', 50).notNullable();
    table.string('parameter_key', 50).notNullable();
    table.decimal('parameter_value', 10, 3).nullable();
    table.decimal('quality_impact', 5, 2).nullable();
    table.decimal('confidence', 3, 2).nullable();
    table.text('insight_text').nullable();
    table.boolean('actionable').defaultTo(true);
    table.boolean('applied').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('coffee_id');
    table.index('roast_id');
    table.index('learning_type');
    table.index('parameter_key');
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('roast_learnings');
}
