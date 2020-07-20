exports.up = function (knex) {
    return Promise.all([
        knex.schema.raw(`
      ALTER TABLE "brainstormResponse" ALTER COLUMN "ipAddress" DROP NOT NULL;
      ALTER TABLE "brainstormReaction" ALTER COLUMN "ipAddress" DROP NOT NULL;
    `)])
};

exports.down = function (knex) {

};


//