// Update with your config settings.

module.exports = {
  development: {
    client: "postgresql",
    connection: {
      database: "db-test-1",
      user: "postgres",
      password: "4MXc5(_inRsJV54J$Ac5",
      port: 5432,
      host: "db-test-1.cr0vlp9alyoi.us-east-2.rds.amazonaws.com"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },

  staging: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },

  production: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }
};
