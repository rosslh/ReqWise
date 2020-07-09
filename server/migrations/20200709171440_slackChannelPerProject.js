exports.up = function (knex, Promise) {
    return knex.schema.table('project', function (t) {
        t.string("slackChannelName").defaultTo("reqwise");
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table('project', function (t) {
        t.dropColumn('slackChannelName');
    });
};