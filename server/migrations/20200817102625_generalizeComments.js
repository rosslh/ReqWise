
exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('comment', function (t) {
      t.dropColumn('requestedDescription');
      t.dropColumn('requestedPriority');
      t
        .integer("stakeholderReview_id")
        .references("stakeholderReview.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
    }),
    knex.schema.raw(`
      ALTER TABLE "comment" ALTER COLUMN "reqversion_id" DROP NOT NULL;
    `)
  ]);
};

exports.down = function (knex) {

};
