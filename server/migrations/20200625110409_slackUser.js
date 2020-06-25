
exports.up = function (knex) {
    return Promise.all([
        knex.schema.createTable("slackUser", (table) => {
            table.increments("id").primary();
            table
                .text("slackId")
                .notNullable();
            table.string("name");
            table.string("email").notNullable();
            table.timestamp("created_at").defaultTo(knex.fn.now());
        })
    ]);
};

exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTable("slackUser")
    ]);
};
