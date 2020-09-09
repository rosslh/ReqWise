
exports.up = function (knex) {
  return knex.schema.dropTable("account_userclass") // remove product champions
};

exports.down = function (knex) {

};
