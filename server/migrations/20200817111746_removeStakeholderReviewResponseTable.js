
exports.up = function (knex) {
  return Promise.all([
    knex.schema.dropTable("stakeholderReviewResponse")
  ]);
};

exports.down = function (knex) {

};
