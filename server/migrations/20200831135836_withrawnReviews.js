exports.up = function (knex, Promise) {
  return knex.schema.raw(`
  UPDATE "stakeholderReview"
    SET status = 'accepted'
    WHERE status = 'implemented';
    ALTER TABLE "stakeholderReview" DROP CONSTRAINT "stakeholderReview_status_check";
    ALTER TABLE "stakeholderReview" ADD CONSTRAINT "stakeholderReview_status_check" CHECK (status IN ('pending'::text, 'accept'::text, 'requestChanges'::text, 'withdrawn'::text));
  `);
};

exports.down = function (knex, Promise) {

};
