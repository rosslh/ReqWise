exports.up = function (knex) {
    return Promise.all([knex.schema.table('brainstormResponse', function (table) {
        table.timestamp("created_at").defaultTo(knex.fn.now());
    }), knex.schema.table('brainstormReaction', function (table) {
        table.timestamp("created_at").defaultTo(knex.fn.now());
    })]);
};

exports.down = function (knex) {

};
