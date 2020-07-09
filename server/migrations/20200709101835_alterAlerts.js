exports.up = function (knex) {
    return Promise.all([knex.schema.table('alert', function (table) {
        table
            .integer("entity_reqversion_id")
            .references("reqversion.id")
            .onDelete("SET NULL")
            .unsigned();

    }),

    knex.schema.raw(`
      ALTER TABLE "alert" DROP CONSTRAINT "alert_entityType_check";
      ALTER TABLE "alert" ADD CONSTRAINT "alert_entityType_check" CHECK ("entityType" IN ('reqgroup', 'requirement', 'reqversion', 'file', 'stakeholderGroup', 'userclass'));
    `)])
};

exports.down = function (knex) {
    return knex.schema.table('account', function (t) {
        t.dropColumn('slackUser_id');
    });
};