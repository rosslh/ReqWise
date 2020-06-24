exports.up = function (knex, Promise) {
    return knex.schema.table('reqversion', function (t) {
        t.text('slackMessageTs');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table('reqversion', function (t) {
        t.dropColumn('slackMessageTs');
    });
};