exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('stakeholderReview', function (t) {
      t
        .boolean("is_outdated")
        .defaultTo(false)
        .notNullable();
    }),
  ]);
};

exports.down = function (knex) {

};
