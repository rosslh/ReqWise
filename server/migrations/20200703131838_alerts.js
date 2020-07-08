
exports.up = function (knex) {
    return Promise.all([
        knex.schema.createTable("alert", (table) => {
            table.increments("id").primary();
            table.enu("actionType", ["create", "update", "delete", "comment", "changeStatus"]).notNullable();
            table.enu("entityType", ["reqgroup", "requirement", "file", "stakeholderGroup", "userclass"]).notNullable();

            table.text("description");

            table
                .integer("entity_reqgroup_id")
                .references("reqgroup.id")
                .onDelete("SET NULL")
                .unsigned();

            table
                .integer("entity_requirement_id")
                .references("requirement.id")
                .onDelete("SET NULL")
                .unsigned();

            table
                .integer("entity_file_id")
                .references("file.id")
                .onDelete("SET NULL")
                .unsigned();

            table
                .integer("entity_stakeholderGroup_id")
                .references("stakeholderGroup.id")
                .onDelete("SET NULL")
                .unsigned();

            table
                .integer("entity_userclass_id")
                .references("userclass.id")
                .onDelete("SET NULL")
                .unsigned();

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
                .unsigned(); // can be created by system

            table.timestamp("created_at").defaultTo(knex.fn.now());
        }),
        knex.schema.createTable("account_alert", (table) => {
            table.increments("id").primary();

            table.integer("account_id")
                .references("account.id")
                .onUpdate("CASCADE")
                .onDelete("CASCADE")
                .unsigned().notNullable();

            table.integer("alert_id")
                .references("alert.id")
                .onUpdate("CASCADE")
                .onDelete("CASCADE")
                .unsigned().notNullable();

            table.boolean("is_read").defaultTo(false);
        })
    ]);
};

exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTable("account_alert"),

        knex.schema.dropTable("alert"),
    ]);
};
