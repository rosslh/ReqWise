
exports.up = function (knex) {
    return Promise.all([
        knex.schema.createTable("brainstormForm", (table) => {
            table.increments("id").primary();
            table.text("description");
            table
                .integer("project_id")
                .references("project.id")
                .onUpdate("CASCADE")
                .onDelete("CASCADE")
                .unsigned()
                .notNullable();
            table.integer("created_by")
                .references("account.id")
                .onUpdate("CASCADE")
                .onDelete("CASCADE")
                .unsigned()
                .notNullable();
            table.timestamp("created_at").defaultTo(knex.fn.now());
            table.boolean("is_public").defaultTo(false);
            table.boolean("is_open").defaultTo(true);
            table.boolean("is_draft").defaultTo(true);
        }),
        knex.schema.createTable("brainstormPrompt", (table) => {
            table.increments("id").primary();
            table.text("prompt").notNullable();
            table
                .integer("brainstormForm_id")
                .references("brainstormForm.id")
                .onUpdate("CASCADE")
                .onDelete("CASCADE")
                .unsigned()
                .notNullable();
            table.enu("responseType", ["text", "paragraph", "radio", "checkbox", "dropdown", "numeric", "likert"]).notNullable();
            table.integer("numericFloor");
            table.integer("numericCeiling");
            table.timestamp("created_at").defaultTo(knex.fn.now());
        }),
        knex.schema.createTable("brainstormResponseOption", (table) => { // only for radio, checkbox, and dropdown
            table.increments("id").primary();
            table.text("value").notNullable();
            table
                .integer("brainstormPrompt_id")
                .references("brainstormPrompt.id")
                .onUpdate("CASCADE")
                .onDelete("CASCADE")
                .unsigned()
                .notNullable();
        }),
        knex.schema.createTable("brainstormResponse", (table) => {
            table.increments("id").primary();
            table.text("ipAddress").notNullable();
            table
                .integer("brainstormResponseOption_id")
                .references("brainstormResponseOption.id")
                .onUpdate("CASCADE")
                .onDelete("CASCADE")
                .unsigned(); // only for radio, checkbox, and dropdown
            table.text("textResponse"); // only for text and paragraph
            table.integer("numericResponse"); // only for numeric and likert
            table
                .integer("account_id")
                .references("account.id")
                .onUpdate("CASCADE")
                .onDelete("CASCADE")
                .unsigned(); // can be anonymous
        }),
        knex.schema.createTable("brainstormReaction", (table) => {
            table.increments("id").primary();
            table.text("ipAddress").notNullable();
            table.enu("reactionType", ["upvote", "downvote"]).defaultTo("upvote").notNullable();
            table
                .integer("brainstormResponse_id")
                .references("brainstormResponse.id")
                .onUpdate("CASCADE")
                .onDelete("CASCADE")
                .unsigned()
                .notNullable();
            table
                .integer("account_id")
                .references("account.id")
                .onUpdate("CASCADE")
                .onDelete("CASCADE")
                .unsigned(); // can be anonymous
        }),
        knex.schema.createTable("brainstormResponse_requirement", (table) => {
            table.increments("id").primary();
            table
                .integer("brainstormResponse_id")
                .references("brainstormResponse.id")
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
        }),
        knex.schema.createTable("brainstormResponse_reqgroup", (table) => {
            table.increments("id").primary();
            table
                .integer("brainstormResponse_id")
                .references("brainstormResponse.id")
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
        }),
    ]);
};

exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTable("brainstormResponse_reqgroup"),
        knex.schema.dropTable("brainstormResponse_requirement"),
        knex.schema.dropTable("brainstormReaction"),
        knex.schema.dropTable("brainstormResponse"),
        knex.schema.dropTable("brainstormResponseOption"),
        knex.schema.dropTable("brainstormPrompt"),
        knex.schema.dropTable("brainstormForm"),
    ]);
};
