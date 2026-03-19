import dotenv from 'dotenv';

dotenv.config();

const config = {
  development: {
    client: 'pg',
    connection: {
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
    }
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    },
    migrations: {
      directory: './src/migrations'
    },
    seeds: {
      directory: './src/seeds'
    }
  }
};

export default config[process.env.NODE_ENV || 'development'];
