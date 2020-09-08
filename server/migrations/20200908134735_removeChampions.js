
exports.up = function (knex) {
  knex.schema.dropTable("account_userclass") // remove product champions
};

exports.down = function (knex) {

};
