
exports.up = function (knex) {
  return knex.schema.table('account', function (t) {
    t
      .boolean("doneTour")
      .defaultTo(false)
      .notNullable();
  })
};

exports.down = function (knex) {

};
