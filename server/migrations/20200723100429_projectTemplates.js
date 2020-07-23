exports.up = function (knex) {
    return Promise.all([
        knex.schema.createTable("projectTemplate", (table) => {
            table.increments("id").primary();
            table.json("data").notNullable();
            table.integer("team_id").references("team.id").unsigned().notNullable();
            table.timestamp("created_at").defaultTo(knex.fn.now());
            table.string("name");
            table.integer("created_by")
                .references("account.id")
                .unsigned()
                .notNullable();
        })
    ])
};

exports.down = function (knex) {
};