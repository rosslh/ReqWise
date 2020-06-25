exports.up = function (knex, Promise) {
    return knex.schema.raw(`
      ALTER TABLE "comment" ALTER COLUMN "account_id" DROP NOT NULL;
    `);
};

// The reverse migration is similar
exports.down = function (knex, Promise) {

};