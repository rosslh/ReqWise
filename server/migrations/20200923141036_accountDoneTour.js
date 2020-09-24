
exports.up = function (knex) {
  return knex.schema.table('account', function (t) {
    t
      .boolean("doneTeamTour")
      .defaultTo(false)
      .notNullable();
    t
      .boolean("doneProjectTour")
      .defaultTo(false)
      .notNullable();
  })
};

exports.down = function (knex) {

};
