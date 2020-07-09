exports.up = function (knex, Promise) {
    return knex.schema.table('requirement', function (t) {
        t.dropColumn('is_archived');
    });
};

exports.down = function (knex, Promise) {
};