exports.up = function (knex, Promise) {
    return knex.schema.raw(`
      ALTER TABLE "reqversion" ALTER COLUMN "rationale" DROP NOT NULL;
    `);
};

// The reverse migration is similar
exports.down = function (knex, Promise) {

};