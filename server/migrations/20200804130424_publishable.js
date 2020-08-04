exports.up = function (knex) {
  return Promise.all([

    knex.schema.table('reqgroup', function (table) {
      table
        .boolean("is_draft")
        .defaultTo(true);
    }),

    knex.schema.table('file', function (table) {
      table
        .boolean("is_draft")
        .defaultTo(true);
    }),

    knex.schema.table('userclass', function (table) {
      table
        .boolean("is_draft")
        .defaultTo(true);
    }),

  ])
};

exports.down = function (knex) {

};
