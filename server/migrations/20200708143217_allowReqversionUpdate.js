exports.up = function (knex, Promise) {
    return knex.schema.table('reqversion', function (t) {
        t.timestamp("updated_at").defaultTo(knex.fn.now());
        t
            .integer("updated_by") // don't cascade delete for user account deletion
            .references("account.id")
            .unsigned();
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table('reqversion', function (t) {
        t.dropColumn('updated_at');
        t.dropColumn('updated_by');
    });
};