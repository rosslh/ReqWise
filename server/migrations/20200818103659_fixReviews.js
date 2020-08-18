exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('stakeholderReview', function (t) {
      t.dropColumn('signedOffBy');
      t
        .integer("reviewedBy")
        .references("account.id")
        .onUpdate("CASCADE")
        .onDelete("SET NULL")
        .unsigned();
    }),
  ]);
};

exports.down = function (knex) {

};
