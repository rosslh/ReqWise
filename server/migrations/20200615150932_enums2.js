exports.up = function (knex, Promise) {
    return knex.schema.raw(`
      ALTER TABLE "file" DROP CONSTRAINT "file_type_check";
      ALTER TABLE "file" ADD CONSTRAINT "file_type_check" CHECK (type IN ('diagram'::text, 'upload'::text, 'externalResource'::text));
    `);
};

// The reverse migration is similar
exports.down = function (knex, Promise) {
    return knex.schema.raw(`
      ALTER TABLE "file" DROP CONSTRAINT "file_type_check";
      ALTER TABLE "file" ADD CONSTRAINT "file_type_check" CHECK (type IN ('diagram'::text, 'upload'::text));
    `);
};