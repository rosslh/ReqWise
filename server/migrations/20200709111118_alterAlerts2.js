exports.up = function (knex) {
    return Promise.all([knex.schema.table('alert', function (table) {
        table
            .string("newValue")

    })]);
};

exports.down = function (knex) {
    return knex.schema.table('alert', function (t) {
        t.dropColumn('newValue');
    });
};