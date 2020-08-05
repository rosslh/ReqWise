
exports.up = function (knex) {
  return knex.schema.raw(`
  ALTER TABLE "comment"
  DROP COLUMN "type"
  `);
};

exports.down = function (knex) {

};
