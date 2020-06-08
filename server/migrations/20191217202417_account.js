exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable("account", (table) => {
      table.increments("id").primary();
      table.string("name");
      table.string("email").notNullable().unique();
      table.string("verification_token");
      table.string("password_hash");
      table.boolean("is_verified").notNullable();
      table.enu("theme", ["light", "system", "dark"]).defaultTo("light");
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
    knex.schema.createTable("stakeholderGroup", (table) => {
      table.increments("id").primary();
      table
        .integer("ppuid_id")
        .references("per_project_unique_id.id")
        .unsigned()
        .notNullable(); /* uniqueness enforced in business logic */
      table
        .integer("project_id")
        .references("project.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table.string("name").notNullable();
      table.string("description", 2000);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.integer("created_by")
        .references("account.id")
        .unsigned(); // can be created by seed script
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.integer("updated_by")
        .references("account.id")
        .unsigned(); // can be created by seed script
    }),
    knex.schema.createTable("account_stakeholderGroup", (table) => {
      table.increments("id").primary();
      table
        .integer("stakeholderGroup_id")
        .references("stakeholderGroup.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table
        .integer("account_id")
        .references("account.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table.string("description", 2000);
      table.unique(["stakeholderGroup_id", "account_id"]);
    }),
    knex.schema.createTable("stakeholderGroup_reqgroup", (table) => {
      table.increments("id").primary();
      table
        .integer("stakeholderGroup_id")
        .references("stakeholderGroup.id")
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
    knex.schema.createTable("stakeholderGroup_requirement", (table) => {
      table.increments("id").primary();
      table
        .integer("stakeholderGroup_id")
        .references("stakeholderGroup.id")
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
        .integer("ppuid_id")
        .references("per_project_unique_id.id")
        .unsigned()
        .notNullable(); /* uniqueness enforced in business logic */
      table
        .integer("project_id")
        .references("project.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table.string("name").notNullable();
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
        .integer("ppuid_id")
        .references("per_project_unique_id.id")
        .unsigned()
        .notNullable(); /* uniqueness enforced in business logic */
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
      table
        .integer("parent_requirement_id")
        .references("requirement.id")
        .unsigned();
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
    knex.schema.createTable("model", (table) => {
      table.increments("id").primary();
      table
        .integer("ppuid_id")
        .references("per_project_unique_id.id")
        .unsigned()
        .notNullable(); /* uniqueness enforced in business logic */
      table.string("name").notNullable();
      table.string("description");
      table.text("svg");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.integer("created_by")
        .references("account.id")
        .unsigned().notNullable();
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.integer("updated_by")
        .references("account.id")
        .unsigned().notNullable();
      table
        .integer("project_id")
        .references("project.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
    }),
    knex.schema.createTable("per_project_unique_id", (table) => {
      table.increments("id").primary();
      table
        .integer("project_id")
        .references("project.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table.integer("readable_id")
        .unsigned().notNullable();
      table.unique(["project_id", "readable_id"]);
    })
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTable("model"),

    knex.schema.dropTable("account_stakeholderGroup"),
    knex.schema.dropTable("stakeholderGroup_reqgroup"),
    knex.schema.dropTable("stakeholderGroup_requirement"),
    knex.schema.dropTable("stakeholderGroup"),
    knex.schema.dropTable("teamInvite"),

    knex.schema.dropTable("comment"),
    knex.schema.dropTable("reqversion"),
    knex.schema.dropTable("requirement"),
    knex.schema.dropTable("reqgroup"),
    knex.schema.dropTable("per_project_unique_id"),
    knex.schema.dropTable("project"),
    knex.schema.dropTable("account_team"),
    knex.schema.dropTable("team"),
    knex.schema.dropTable("account"),
  ]);
};
