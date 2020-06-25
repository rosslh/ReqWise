exports.up = function (knex, Promise) {
    return knex.schema.raw(`
      ALTER TABLE "comment" ALTER COLUMN "quillDelta" DROP NOT NULL;
    `);
};

// The reverse migration is similar
exports.down = function (knex, Promise) {

};