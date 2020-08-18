exports.up = function (knex, Promise) {
  return knex.schema.raw(`
  UPDATE "reqversion"
    SET status = 'accepted'
    WHERE status = 'implemented';
    ALTER TABLE "reqversion" DROP CONSTRAINT "reqversion_status_check";
    ALTER TABLE "reqversion" ADD CONSTRAINT "reqversion_status_check" CHECK (status IN ('proposed'::text, 'accepted'::text, 'modified'::text));
  `);
};

exports.down = function (knex, Promise) {

};
