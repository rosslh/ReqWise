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

  fastify.decorate("updateReviews", async function (entityType, entityId, request) {
    const { project_id, is_draft, name } = await fastify.knex.from(entityType).select("*").where("id", entityId).first();

    await fastify
      .knex("stakeholderReview")
      .where({ [`entity_${entityType}_id`]: entityId, status: "pending" })
      .update({
        status: "withdrawn"
      })
      .returning(["id"]);

    if (is_draft) {
      return; // drafts don't need reviews
    }

    const [id] = await fastify
      .knex("stakeholderReview")
      .insert({
        project_id,
        status: "pending",
        entityType,
        [`entity_${entityType}_id`]: entityId // computed property name syntax
      }).returning("id");

    await fastify.createBaseline(id);

    await fastify.createAlert("create", "stakeholderReview", name, id, project_id, request.user.id);

    const { slackAccessToken: token } = await fastify.knex
      .from("project")
      .select("team.*", "project.*")
      .join("team", "team.id", "project.team_id")
      .where("project.id", project_id)
      .first();
    if (token) {
      const channel = await fastify.slackGetChannelId(project_id);
      await fastify.slack.chat.postMessage({
        text: `${request.user.name} started a new review: <https://reqwise.com/project/${fastify.obfuscateId(request.params.projectId)}/reviews/${fastify.obfuscateId(id)}|${name}>.`,
        token,
        channel,
        username: request.user.name,
        icon_url: request.user.imageName && `https://storage.googleapis.com/user-file-storage/${request.user.imageName}`
      });
      return [id];
    }
  });

  fastify.decorate("getReviewedEntity", async function (review_id) {
    const review = await fastify.knex
      .from("stakeholderReview")
      .leftJoin("account", "account.id", "stakeholderReview.reviewedBy")
      .select("stakeholderReview.*", "account.name as reviewerName", "stakeholderReview.id as id")
      .where("stakeholderReview.id", review_id).first();

    const entityId = review[`entity_${review.entityType}_id`];

    let baseline = await fastify.knex.from(review.entityType)
      .select("*", "readable_id as ppuid", `${review.entityType}.id as id`)
      .where("stakeholderReview_id", review_id)
      .join("per_project_unique_id", "per_project_unique_id.id", "ppuid_id")
      .first();

    if (review.entityType === "reqgroup") {
      baseline = await fastify.getReqgroup(baseline.id);
    }

    const latestReview = await fastify.getLatestReview(review.entityType, baseline.id);

    return {
      ...baseline,
      entityId: fastify.obfuscateId(entityId), // id of original entity which baseline is based on
      latestReview
    };

  });

  fastify.decorate("getReviewStakeholders", async function (review_id) {
    const review = await fastify.knex
      .from("stakeholderReview")
      .leftJoin("account", "account.id", "stakeholderReview.reviewedBy")
      .select("*", "account.name as reviewerName", "stakeholderReview.id as id")
      .where("stakeholderReview.id", review_id).first();

    if (review.entityType !== "reqgroup") {
      return [];
    }

    const entityId = review[`entity_${review.entityType}_id`];

    return (await fastify.knex.from(`stakeholderGroup_reqgroup`)
      .join("stakeholderGroup", "stakeholderGroup.id", `stakeholderGroup_reqgroup.stakeholderGroup_id`)
      .join("account_stakeholderGroup", "account_stakeholderGroup.stakeholderGroup_id", "stakeholderGroup.id")
      .join("account", "account.id", "account_stakeholderGroup.account_id")
      .select("account.id")
      .where(`stakeholderGroup_reqgroup.reqgroup_id`, entityId))
      .map(x => fastify.obfuscateId(x.id));
  });

  done();
});
