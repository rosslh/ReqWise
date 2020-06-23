exports.up = function (knex, Promise) {
    return knex.schema.table('team', function (t) {
        t.text('slackTeamName');
        t.text('slackAccessToken');
        t.text('slackTeamId');
        t.text('slackBotUserId');
        t.text('slackBotAccessToken');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table('team', function (t) {
        t.dropColumn('slackTeamName');
        t.dropColumn('slackAccessToken');
        t.dropColumn('slackTeamId');
        t.dropColumn('slackBotUserId');
        t.dropColumn('slackBotAccessToken');
    });
};