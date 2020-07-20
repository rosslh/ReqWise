exports.up = function (knex) {
    return Promise.all([knex.schema.table('alert', function (table) {
        table
            .integer("entity_brainstormForm_id")
            .references("brainstormForm.id")
            .onDelete("SET NULL")
            .unsigned();

    }),

    knex.schema.raw(`
      ALTER TABLE "alert" DROP CONSTRAINT "alert_entityType_check";
      ALTER TABLE "alert" ADD CONSTRAINT "alert_entityType_check" CHECK ("entityType" IN ('reqgroup', 'requirement', 'reqversion', 'file', 'stakeholderGroup', 'userclass', 'questionnaire'));
    `)])
};

exports.down = function (knex) {

};