require("dotenv").config();

// Update with your config settings.
module.exports = {
  production: {
    client: "pg",
    connection: {
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASS,
      port: process.env.DB_PORT,
      host: process.env.DB_HOST
    },
    pool: {
      min: 2,
      max: 12
    },
    migrations: {
      tableName: "knex_migrations"
    },
    seeds: {
      directory: 'no-seeding-production'
    }
  },

  qa: {
    client: "pg",
    connection: {
      database: process.env.QA_DB_NAME,
      user: process.env.QA_DB_USERNAME,
      password: process.env.QA_DB_PASS,
      port: process.env.QA_DB_PORT,
      host: process.env.QA_DB_HOST
    },
    pool: {
      min: 2,
      max: 12
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },

  dev: {
    client: "pg",
    connection: {
      database: "reqwise",
      user: "postgres",
      password: "1234",
      port: "5432",
      host: "127.0.0.1"
    },
    pool: {
      min: 2,
      max: 12
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },
};
