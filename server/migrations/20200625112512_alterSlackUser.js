exports.up = function (knex, Promise) {
    return knex.schema.table('slackUser', function (t) {
        t
            .integer("team_id")
            .references("team.id")
            .unsigned().notNullable();
        t.text('slackTeamId').notNullable();
        t.unique(["slackId", "slackTeamId"]);
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table('comment', function (t) {
        t.dropColumn('slackUser_id');
    });
};