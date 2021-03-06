
exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable("stakeholderReview", (table) => {
      table.increments("id").primary();
      table.enu("status", ["pending", "accept", "requestChanges"]).defaultTo("pending");
      table
        .integer("signedOffBy")
        .references("account.id")
        .onUpdate("CASCADE")
        .onDelete("SET NULL")
        .unsigned();
      table
        .integer("project_id")
        .references("project.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table
        .integer("entity_reqgroup_id")
        .references("reqgroup.id")
        .onDelete("SET NULL")
        .unsigned();
      table
        .integer("entity_file_id")
        .references("file.id")
        .onDelete("SET NULL")
        .unsigned();
      table
        .integer("entity_userclass_id")
        .references("userclass.id")
        .onDelete("SET NULL")
        .unsigned();
      table
        .integer("entity_brainstormForm_id")
        .references("brainstormForm.id")
        .onDelete("SET NULL")
        .unsigned();
      table.enu("entityType", ["reqgroup", "file", "userclass", "brainstormForm"]).notNullable();
      table.text("comment");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("completed_at");
    }),
    knex.schema.createTable("stakeholderReviewResponse", (table) => {
      table.increments("id").primary();
      table.enu("status", ["comment", "accept", "requestChanges"]).defaultTo("comment");
      table
        .integer("account_id")
        .references("account.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table
        .integer("stakeholderReview_id")
        .references("stakeholderReview.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.text("comment");
    })
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTable("stakeholderReviewResponse"),
    knex.schema.dropTable("stakeholderReview"),
  ]);
};
