
exports.up = function (knex) {
    return Promise.all([
        knex.schema.dropTable("brainstormResponse_reqgroup"),
        knex.schema.dropTable("brainstormResponse_requirement"),

        knex.schema.createTable("brainstormPrompt_requirement", (table) => {
            table.increments("id").primary();
            table
                .integer("brainstormPrompt_id")
                .references("brainstormPrompt.id")
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
            table.text("details");
        }),
        knex.schema.createTable("brainstormPrompt_reqgroup", (table) => {
            table.increments("id").primary();
            table
                .integer("brainstormPrompt_id")
                .references("brainstormPrompt.id")
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
            table.text("details");
        }),
    ]);
};

exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTable("brainstormPrompt_requirement"),
        knex.schema.dropTable("brainstormPrompt_reqgroup")
    ])
};
