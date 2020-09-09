
exports.up = function (knex) {
  return (knex.schema.table('stakeholderReview', function (t) {
    t.dropColumn('entity_reqgroup_id');
    t.dropColumn('entity_file_id');
    t.dropColumn('entity_userclass_id');
  }));
}

exports.down = function (knex) {

};
