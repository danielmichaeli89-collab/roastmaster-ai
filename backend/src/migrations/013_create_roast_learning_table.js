/**
 * MIGRATION: 013_create_roast_learning_table.js
 * Creates roast_learnings table for AI learning from historical roast→cupping correlations
 */

export async function up(knex) {
  return knex.schema.createTable('roast_learnings', (table) => {
    // Identity
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign keys
    table.uuid('coffee_id').notNullable().references('id').inTable('green_coffees').onDelete('CASCADE');
    table.uuid('roast_id').notNullable().references('id').inTable('roasts').onDelete('CASCADE');
    table.uuid('cupping_id').nullable().references('id').inTable('cupping_notes').onDelete('SET NULL');

    // Learning classification
    table.string('learning_type', 50).notNullable()
      .comment('profile_optimization, anomaly_correlation, flavor_mapping, technique_improvement');

    // Parameter being optimized
    table.string('parameter_key', 50).notNullable()
      .comment('e.g. charge_temp, dev_ratio, ror_smoothness, yellowing_duration');

    table.decimal('parameter_value', 10, 3).nullable()
      .comment('Numeric value of the parameter (e.g., 195.5 for charge temp in C)');

    // Impact assessment
    table.decimal('quality_impact', 5, 2).nullable()
      .comment('Positive = improved cup quality, Negative = worsened');

    table.decimal('confidence', 3, 2).nullable()
      .comment('0-1 scale: how confident is the AI in this learning (based on data patterns)');

    // AI-generated insight
    table.text('insight_text').nullable()
      .comment('Human-readable insight: "Increasing yellowing duration by 10s improved sweetness by 0.8 points"');

    // Application tracking
    table.boolean('actionable').defaultTo(true)
      .comment('Can this learning be applied to future roasts?');

    table.boolean('applied').defaultTo(false)
      .comment('Has this learning been applied to a subsequent roast?');

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes for performance and queries
    table.index('coffee_id');
    table.index('roast_id');
    table.index('learning_type');
    table.index('parameter_key');
    table.index('applied');
    table.index('confidence');
  });
}

export async function down(knex) {
  return knex.schema.dropTable('roast_learnings');
}
