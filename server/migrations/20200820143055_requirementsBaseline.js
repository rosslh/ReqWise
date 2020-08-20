
exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('reqgroup', function (t) {
      t
        .boolean("is_baseline")
        .defaultTo(false)
        .notNullable();
      t
        .integer("stakeholderReview_id")
        .references("stakeholderReview.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned();
    }),
    knex.schema.table('file', function (t) {
      t
        .boolean("is_baseline")
        .defaultTo(false)
        .notNullable();
      t
        .integer("stakeholderReview_id")
        .references("stakeholderReview.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned();
    }),
    knex.schema.table('userclass', function (t) {
      t
        .boolean("is_baseline")
        .defaultTo(false)
        .notNullable();
      t
        .integer("stakeholderReview_id")
        .references("stakeholderReview.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned();
    }),
  ]);
};

exports.down = function (knex) {

};
