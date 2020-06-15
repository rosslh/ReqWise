
exports.up = function (knex) {
    return Promise.all([
        knex.schema.createTable("userclass", (table) => {
            table.increments("id").primary();
            table.integer("project_id")
                .references("project.id")
                .unsigned().notNullable();
            table.string("name").notNullable();
            table.string("description");
            table.string("persona");
            table.enu("importance", ["favored", "disfavored", "ignored", "other"]).defaultTo("favored");
            table
                .integer("ppuid_id")
                .references("per_project_unique_id.id")
                .unsigned()
                .notNullable();
            table.timestamp("created_at").defaultTo(knex.fn.now());
            table.integer("created_by")
                .references("account.id")
                .unsigned().notNullable();
            table.timestamp("updated_at").defaultTo(knex.fn.now());
            table.integer("updated_by")
                .references("account.id")
                .unsigned().notNullable();
        }),

        knex.schema.createTable("account_userclass", (table) => { // AKA product champions
            table.increments("id").primary();
            table
                .integer("userclass_id")
                .references("userclass.id")
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
            table.unique(["userclass_id", "account_id"]);
        }),
    ]);
};

exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTable("account_userclass"),
        knex.schema.dropTable("userclass"),
    ]);
};