exports.up = function (knex, Promise) {
    return knex.schema.table('comment', function (t) {
        t
            .integer("slackUser_id")
            .references("slackUser.id")
            .unsigned()
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table('comment', function (t) {
        t.dropColumn('slackUser_id');
    });
};