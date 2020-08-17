
exports.up = function (knex) {
  knex.schema.dropTable("stakeholderReviewResponse")
};

exports.down = function (knex) {

};
