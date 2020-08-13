const fp = require("fastify-plugin");

module.exports = fp(function (fastify, opts, done) {

  fastify.decorate("getLatestReview", async function (entityType, entityId) {
    const foreignId = `entity_${entityType}_id`;
    return await fastify.knex
      .from("stakeholderReview")
      .select("*")
      .where(foreignId, entityId)
      .andWhere(
        "stakeholderReview.created_at",
        "=",
        fastify.knex.raw(
          `(select max(created_at) from "stakeholderReview" where "stakeholderReview"."${foreignId}"=${entityId})`
        ))
      .first();
  });

  fastify.decorate("createPendingReview", async function (entityType, entityId) {
    const { project_id, is_draft } = await fastify.knex.from(entityType).select("*").where("id", entityId).first();
    if (is_draft) {
      return; // drafts don't need reviews
    }
    const pendingReviewExists = (await fastify.knex
      .from("stakeholderReview")
      .select("*")
      .where({ [`entity_${entityType}_id`]: entityId, status: "pending" })).length;

    if (pendingReviewExists) {
      return;
    }

    await fastify
      .knex("stakeholderReview")
      .insert({
        project_id,
        status: "pending",
        entityType,
        [`entity_${entityType}_id`]: entityId // computed property name syntax
      });
  });

  fastify.decorate("getReviewedEntity", async function (review_id) {
    const review = await fastify.knex
      .from("stakeholderReview")
      .select("*", "stakeholderReview.id as id")
      .where("id", review_id).first();

    const entityId = review[`entity_${review.entityType}_id`];

    const entity = await fastify.knex.from(review.entityType)
      .select("*", "readable_id as ppuid", `${review.entityType}.id as id`)
      .where(`${review.entityType}.id`, entityId)
      .join("per_project_unique_id", "per_project_unique_id.id", "ppuid_id")
      .first();

    const latestReview = await fastify.getLatestReview(review.entityType, entityId);

    return {
      ...entity,
      latestReviewStatus: latestReview && latestReview.status
    };

  });

  done();
});
