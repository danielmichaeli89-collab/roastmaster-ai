/**
 * Migration 014: Add missing columns to users table
 * Adds username, full_name, organization_name, roester_serial_number, is_active, last_login_at, updated_at
 */

export const up = async (knex) => {
  const hasTable = await knex.schema.hasTable('users');

  if (!hasTable) {
    console.log('users table does not exist');
    return;
  }

  // Check if columns already exist
  const hasUsername = await knex.schema.hasColumn('users', 'username');
  const hasFullName = await knex.schema.hasColumn('users', 'full_name');
  const hasOrgName = await knex.schema.hasColumn('users', 'organization_name');
  const hasSerialNum = await knex.schema.hasColumn('users', 'roester_serial_number');
  const hasIsActive = await knex.schema.hasColumn('users', 'is_active');
  const hasLastLogin = await knex.schema.hasColumn('users', 'last_login_at');
  const hasUpdatedAt = await knex.schema.hasColumn('users', 'updated_at');

  return knex.schema.table('users', (table) => {
    if (!hasUsername) {
      table.string('username', 100).nullable();
    }
    if (!hasFullName) {
      table.string('full_name', 200).nullable();
    }
    if (!hasOrgName) {
      table.string('organization_name', 200).nullable();
    }
    if (!hasSerialNum) {
      table.string('roester_serial_number', 100).nullable();
    }
    if (!hasIsActive) {
      table.boolean('is_active').defaultTo(true);
    }
    if (!hasLastLogin) {
      table.timestamp('last_login_at').nullable();
    }
    if (!hasUpdatedAt) {
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    }
  });
};

export const down = async (knex) => {
  return knex.schema.table('users', (table) => {
    table.dropColumnIfExists('username');
    table.dropColumnIfExists('full_name');
    table.dropColumnIfExists('organization_name');
    table.dropColumnIfExists('roester_serial_number');
    table.dropColumnIfExists('is_active');
    table.dropColumnIfExists('last_login_at');
    table.dropColumnIfExists('updated_at');
  });
};
