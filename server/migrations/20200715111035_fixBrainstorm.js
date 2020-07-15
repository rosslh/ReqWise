exports.up = function (knex) {
    return Promise.all([knex.schema.table('brainstormResponse', function (table) {
        table
            .integer("brainstormPrompt_id")
            .references("brainstormPrompt.id")
            .onDelete("CASCADE")
            .unsigned()
            .notNullable();

    })]);
};

exports.down = function (knex) {
    return knex.schema.table('brainstormResponse', function (t) {
        t.dropColumn('brainstormPrompt_id');
    });
};