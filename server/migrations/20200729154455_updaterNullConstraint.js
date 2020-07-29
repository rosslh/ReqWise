exports.up = function (knex, Promise) {
  return knex.schema.raw(`
    ALTER TABLE "reqversion" ALTER COLUMN "updated_by" SET NOT NULL;
  `);
};

// The reverse migration is similar
exports.down = function (knex, Promise) {

};
