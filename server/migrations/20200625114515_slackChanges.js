exports.up = function (knex, Promise) {
    return knex.schema.raw(`
      ALTER TABLE "slackUser" ALTER COLUMN "email" DROP NOT NULL;
    `);
};

// The reverse migration is similar
exports.down = function (knex, Promise) {

};