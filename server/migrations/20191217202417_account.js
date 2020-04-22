exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable("account", (table) => {
      table.increments("id").primary();
      table.string("name");
      table.string("email").notNullable().unique();
      table.string("verification_token");
      table.string("password_hash");
      table.boolean("is_verified").notNullable();
    }),
    knex.schema.createTable("team", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("description");
    }),
    knex.schema.createTable("account_team", (table) => {
      table.increments("id").primary();
      table
        .integer("account_id")
        .references("account.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table
        .integer("team_id")
        .references("team.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table.boolean("is_admin").notNullable();
    }),
    knex.schema.createTable("project", (table) => {
      table.increments("id").primary();
      table.string("name");
      table
        .integer("team_id")
        .references("team.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
    }),
    knex.schema.createTable("reqgroup", (table) => {
      // aka feature
      table.increments("id").primary();
      table
        .integer("project_id")
        .references("project.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
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
          "description",
        ])
        .notNullable();
    }),
    knex.schema.createTable("requirement", (table) => {
      table.increments("id").primary();
      table
        .integer("reqgroup_id")
        .references("reqgroup.id")
        .onUpdate("CASCADE")
        .onDelete("SET NULL") // Requirements from deleted features are just archived
        .unsigned();
      table
        .integer("project_id")
        .references("project.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .notNullable()
        .unsigned();
      table.string("pretty_id").notNullable();
      table.boolean("is_archived").defaultTo(false);
    }),
    knex.schema.createTable("reqversion", (table) => {
      table.increments("id").primary();
      table
        .integer("requirement_id")
        .references("requirement.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table
        .integer("account_id") // don't cascade delete for user account deletion
        .references("account.id")
        .unsigned()
        .notNullable();
      table.enu("priority", ["high", "medium", "low"]).notNullable();
      table
        .enu("status", ["implemented", "inProgress", "accepted", "proposed"])
        .notNullable();
      table.string("description").notNullable();
      table.string("rationale").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
    }),
    knex.schema.createTable("comment", (table) => {
      table.increments("id").primary();
      table
        .integer("reqversion_id")
        .references("reqversion.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table
        .integer("account_id") // don't cascade delete for user account deletion
        .references("account.id")
        .unsigned()
        .notNullable();
      table.string("content").notNullable();
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTable("comment"),
    knex.schema.dropTable("reqversion"),
    knex.schema.dropTable("requirement"),
    knex.schema.dropTable("reqgroup"),
    knex.schema.dropTable("project"),
    knex.schema.dropTable("account_team"),
    knex.schema.dropTable("team"),
    knex.schema.dropTable("account"),
  ]);
};
