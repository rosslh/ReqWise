
exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('comment', function (t) {
      t
        .integer("file_id")
        .references("file.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned();
    })
  ]);
};

exports.down = function (knex) {

};
