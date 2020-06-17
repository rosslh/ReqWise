const QuillDeltaToHtmlConverter = require("quill-delta-to-html")
  .QuillDeltaToHtmlConverter;
const htmlToMrkdwn = require("html-to-mrkdwn");
module.exports = async function (fastify, opts) {
  const getCommentsSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        reqversionId: { type: "string" },
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
        items: {
          type: "object",
          properties: {
            id: { type: "number" },
            account_id: { type: "number" },
            authorName: { type: "string" },
            authorEmail: { type: "string" },
            authorImageName: { type: "string" },
            authorPlaceholderImage: { type: "string" },
            quillDelta: { type: "string" },
            plaintext: { type: "string" },
            html: { type: "string" },
            mrkdwn: { type: "string" },
            type: { type: "string" },
            requestedDescription: { type: "string" },
            requestedPriority: { type: "string" },
            created_at: { type: "string" },
          },
        },
      },
    },
  };
  fastify.get(
    "/reqversions/:reqversionId/comments",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getCommentsSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("comment")
        .select(
          "comment.*",
          "account.name as authorName",
          "account.email as authorEmail",
          "account.imageName as authorImageName",
          "account.placeholderImage as authorPlaceholderImage"

        )
        .join("account", "account.id", "=", "comment.account_id")
        .where({
          reqversion_id: request.params.reqversionId,
        });
    }
  );
  const postCommentSchema = {
    body: {
      type: "object",
      properties: {
        quillDelta: { type: "string" },
        plaintext: { type: "string" },
        type: { type: "string" },
        requestedDescription: { type: "string" },
        requestedPriority: { type: "string" },
      },
      required: ["quillDelta", "plaintext", "type"],
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        reqversionId: { type: "string" },
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
        items: { type: "string" },
        maxItems: 1,
      },
    },
  };
  fastify.post(
    "/reqversions/:reqversionId/comments",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postCommentSchema,
    },
    async function (request, reply) {
      const {
        plaintext,
        quillDelta,
        type,
        requestedDescription,
        requestedPriority,
      } = request.body;

      const quillDeltaConverter = new QuillDeltaToHtmlConverter(
        JSON.parse(quillDelta).ops,
        {}
      );
      const html = quillDeltaConverter.convert();
      const mrkdwn = JSON.stringify(htmlToMrkdwn(html));

      await fastify.knex("comment").insert({
        reqversion_id: request.params.reqversionId,
        account_id: request.user.id,
        quillDelta,
        plaintext,
        html,
        mrkdwn,
        type,
        requestedDescription,
        requestedPriority,
      });
      return ["success"];
    }
  );
};
