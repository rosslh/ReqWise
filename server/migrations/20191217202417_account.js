exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable("account", table => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table
        .string("email")
        .notNullable()
        .unique();
      table.string("password_hash").notNullable();
    }),
    knex.schema.createTable("team", table => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("description");
    }),
    knex.schema.createTable("account_team", table => {
      table.increments("id").primary();
      table
        .integer("account_id")
        .unsigned()
        .notNullable();
      table
        .integer("team_id")
        .unsigned()
        .notNullable();
      table.boolean("is_admin").notNullable();
    }),
    knex.schema.createTable("project", table => {
      table.increments("id").primary();
      table.string("name");
      table
        .integer("team_id")
        .unsigned()
        .notNullable();
    }),
    knex.schema.createTable("reqgroup", table => {
      // aka feature
      table.increments("id").primary();
      table
        .integer("project_id")
        .unsigned()
        .notNullable();
      table.string("name").notNullable();
      table.string("pretty_id").notNullable();
      table.string("description");
      table
        .enu("type", [
          "feature",
          "interface",
          "user_classes",
          "product_perspective",
          "description"
        ])
        .notNullable();
    }),
    knex.schema.createTable("requirement", table => {
      table.increments("id").primary();
      table
        .integer("reqgroup_id")
        .unsigned()
        .notNullable();
      table.string("pretty_id").notNullable();
      table.enu("priority", ["high", "medium", "low"]).notNullable();
      table
        .enu("status", ["implemented", "inProgress", "accepted", "proposed"])
        .notNullable();
      table.string("description").notNullable();
    }),
    knex.schema.createTable("reqversion", table => {
      table.increments("id").primary();
      table
        .integer("requirement_id")
        .unsigned()
        .notNullable();
      table
        .integer("account_id")
        .unsigned()
        .notNullable();
      table.string("new_value").notNullable();
      table.string("old_value");
    }),
    knex.schema.createTable("comment", table => {
      table.increments("id").primary();
      table
        .integer("reqversion_id")
        .unsigned()
        .notNullable();
      table
        .integer("account_id")
        .unsigned()
        .notNullable();
      table.string("content").notNullable();
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTable("account"),
    knex.schema.dropTable("team"),
    knex.schema.dropTable("account_team"),
    knex.schema.dropTable("project"),
    knex.schema.dropTable("reqgroup"),
    knex.schema.dropTable("requirement"),
    knex.schema.dropTable("reqversion"),
    knex.schema.dropTable("comment")
  ]);
};
