const QuillDeltaToHtmlConverter = require("quill-delta-to-html")
  .QuillDeltaToHtmlConverter;
const htmlToMrkdwn = require("html-to-mrkdwn");
module.exports = async function (fastify, opts) {
  // Stakeholder reviews

  const getReviewSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        reviewId: { type: "string" },
      },
    },
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" },
      },
      required: ["Authorization"],
    },
    response: {},
  };
  fastify.get(
    "/:reviewId",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getReviewSchema,
    },
    async function (request, reply) {
      const review = await fastify.knex
        .from("stakeholderReview")
        .select("*", "stakeholderReview.id as id")
        .where("stakeholderReview.id", request.params.reviewId)
        .first();

      const responses = await fastify.knex
        .from("comment")
        .select(
          "comment.*",
          "account.name as authorName",
          "account.email as authorEmail",
          "account.imageName as authorImageName",
          "account.placeholderImage as authorPlaceholderImage"
        )
        .join("account", "account.id", "=", "comment.account_id")
        .where("comment.stakeholderReview_id", request.params.reviewId);

      const reviewedEntity = await fastify.getReviewedEntity(request.params.reviewId);
      return { ...review, responses, reviewedEntity };
    });

  const putReviewSchema = {
    body: {
      type: "object",
      properties: {
        status: { type: "string" },
        comment: { type: "string" },
      },
      required: ["status", "comment"],
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        reviewId: { type: "number" },
      },
    },
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" },
      },
      required: ["Authorization"],
    },
    response: {
      200: {
        type: "array",
        maxItems: 1,
        items: { type: "string" },
      },
    },
  };
  fastify.put(
    "/:reviewId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: putReviewSchema,
    },
    async function (request, reply) {
      const { status, comment } = request.body;
      await fastify
        .knex("stakeholderReview")
        .where("id", request.params.reviewId)
        .update({
          status,
          comment,
          reviewedBy: request.user.id,
          completed_at: new Date(Date.now())
        });

      return ["success"];
    }
  );

  const postResponseSchema = {
    body: {
      type: "object",
      properties: {
        reactionType: { type: "string" }
      }
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        responseId: { type: "number" },
      },
    },
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" },
        "Content-Type": { type: "string" },
      },
      required: ["Content-Type"],
    },
    response: {},
  };
  fastify.post(
    "/:reviewId/responses",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: postResponseSchema,
    },
    async function (request, reply) {
      const {
        plaintext,
        quillDelta
      } = request.body;

      const quillDeltaConverter = new QuillDeltaToHtmlConverter(
        JSON.parse(quillDelta).ops,
        {}
      );
      const html = quillDeltaConverter.convert();
      const mrkdwn = JSON.stringify(htmlToMrkdwn(html));

      await fastify.knex("comment").insert({
        stakeholderReview_id: request.params.reviewId,
        account_id: request.user.id,
        quillDelta,
        plaintext,
        html,
        mrkdwn
      });

      return ["success"];
    }
  );
};
