
exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('stakeholderReview', function (t) {
      t.dropColumn('entity_brainstormForm_id');
    }),
    knex.schema.raw(`
      ALTER TABLE "stakeholderReview" DROP CONSTRAINT "stakeholderReview_entityType_check";
      ALTER TABLE "stakeholderReview" ADD CONSTRAINT "stakeholderReview_entityType_check" CHECK ("entityType" IN ('reqgroup', 'file', 'userclass'));
      `)
  ]);
};

exports.down = function (knex) {

};
