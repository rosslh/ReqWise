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

  done();
});
