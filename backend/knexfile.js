import dotenv from 'dotenv';

dotenv.config();

// Railway provides DATABASE_URL with SSL required
// Parse it properly for knex
const productionConnection = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    }
  : 'postgresql://localhost:5432/roastmaster_ai';

const config = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'roastmaster_ai'
    },
    migrations: {
      directory: './src/migrations'
    },
    seeds: {
      directory: './src/seeds'
    },
    pool: { min: 0, max: 5 }
  },

  production: {
    client: 'pg',
    connection: productionConnection,
    migrations: {
      directory: './src/migrations'
    },
    seeds: {
      directory: './src/seeds'
    },
    pool: { min: 0, max: 10 },
    acquireConnectionTimeout: 10000
  }
};

export default config[process.env.NODE_ENV || 'development'];
