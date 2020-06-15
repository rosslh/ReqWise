exports.up = function (knex, Promise) {
    return knex.schema.raw(`
      ALTER TABLE "reqversion" DROP CONSTRAINT "reqversion_status_check";
      ALTER TABLE "reqversion" ADD CONSTRAINT "reqversion_status_check" CHECK (status IN ('proposed'::text, 'accepted'::text, 'modified'::text, 'implemented'::text));
    `);
};

// The reverse migration is similar
exports.down = function (knex, Promise) {
    return knex.schema.raw(`
      ALTER TABLE "reqversion" DROP CONSTRAINT "reqversion_status_check";
      ALTER TABLE "reqversion" ADD CONSTRAINT "reqversion_status_check" CHECK (status IN ('accepted'::text, 'proposed'::text));
    `);
};