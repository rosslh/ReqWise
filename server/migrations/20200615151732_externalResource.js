exports.up = function (knex, Promise) {
    return knex.schema.table('file', function (t) {
        t.string('url');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table('file', function (t) {
        t.dropColumn('url');
    });
};