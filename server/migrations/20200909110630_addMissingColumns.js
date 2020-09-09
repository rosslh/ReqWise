
exports.up = function (knex) {
  return knex.schema.table('stakeholderReview', function (t) {
    t
      .integer("entity_reqgroup_id")
      .references("reqgroup.id")
      .onDelete("CASCADE")
      .unsigned();
    t
      .integer("entity_file_id")
      .references("file.id")
      .onDelete("CASCADE")
      .unsigned();
    t
      .integer("entity_userclass_id")
      .references("userclass.id")
      .onDelete("CASCADE")
      .unsigned();
  })
};

exports.down = function (knex) {

};
