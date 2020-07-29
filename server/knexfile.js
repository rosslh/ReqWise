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
};
