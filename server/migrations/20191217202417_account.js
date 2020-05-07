exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable("account", (table) => {
      table.increments("id").primary();
      table.string("name");
      table.string("email").notNullable().unique();
      table.string("verification_token");
      table.string("password_hash");
      table.boolean("is_verified").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
    }),
    knex.schema.createTable("team", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("description");
      table.timestamp("created_at").defaultTo(knex.fn.now());
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
      table.boolean("isAdmin").notNullable();
      table.boolean("isOwner").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
    }),
    knex.schema.createTable("stakeholder_reqgroup", (table) => {
      table.increments("id").primary();
      table
        .integer("account_id")
        .references("account.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table
        .integer("reqgroup_id")
        .references("reqgroup.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table.string("role").notNullable();
    }),
    knex.schema.createTable("stakeholder_requirement", (table) => {
      table.increments("id").primary();
      table
        .integer("account_id")
        .references("account.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table
        .integer("requirement_id")
        .references("requirement.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table.string("role").notNullable();
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
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.integer("created_by")
        .references("account.id")
        .unsigned()
        .notNullable();
      table.timestamp("reqgroups_updated_at").defaultTo(knex.fn.now()); // updated when reqgroup added or deleted
    }),
    knex.schema.createTable("reqgroup", (table) => {
      table.increments("id").primary();
      table
        .integer("project_id")
        .references("project.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table.string("name").notNullable();
      table.integer("per_project_unique_id").notNullable().unsigned();
      table.string("description", 2000);
      table.boolean("isMaxOneRequirement").defaultTo(false);
      table.boolean("isDeletable").defaultTo(true);
      table.boolean("isPrioritized").defaultTo(true);
      table.enu("type", ["feature", "business", "quality"]).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.integer("created_by")
        .references("account.id")
        .unsigned(); // can be created by seed script
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.integer("updated_by")
        .references("account.id")
        .unsigned(); // can be created by seed script
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
      table.integer("per_project_unique_id").notNullable().unsigned();
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
      table.enu("priority", ["high", "medium", "low"]);
      table
        .enu("status", ["accepted", "proposed"])
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
      table.string("quillDelta", 2000).notNullable();
      table.string("plaintext", 2000).notNullable();
      table.string("html", 2000).notNullable();
      table.string("mrkdwn", 2000).notNullable();
      table.enu("type", ["accept", "comment", "requestChanges"]).notNullable();
      table.string("requestedDescription");
      table.enu("requestedPriority", ["high", "medium", "low"]);
      table.timestamp("created_at").defaultTo(knex.fn.now());
    }),
    knex.schema.createTable("teamInvite", (table) => {
      table.increments("id").primary();
      table.string("inviteeEmail").notNullable();
      table.integer("team_id").references("team.id").unsigned().notNullable();
      table
        .integer("inviter_id")
        .references("account.id")
        .unsigned()
        .notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.boolean("isAdmin").notNullable();
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTable("stakeholder_reqgroup"),
    knex.schema.dropTable("stakeholder_requirement"),
    knex.schema.dropTable("teamInvite"),

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
