exports.up = function (knex, Promise) {
    return knex.schema.table('account', function (t) {
        t
            .integer("slackUser_id")
            .references("slackUser.id")
            .unsigned();
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table('account', function (t) {
        t.dropColumn('slackUser_id');
    });
};