const QuillDeltaToHtmlConverter = require("quill-delta-to-html")
  .QuillDeltaToHtmlConverter;
const htmlToMrkdwn = require("html-to-mrkdwn");
module.exports = async function (fastify, opts) {

  const putReqversionSchema = {
    body: {
      type: "object",
      properties: {
        status: { type: "string" }
      },
      required: ["status"],
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        reqversionId: { type: "number" },
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
    "/:reqversionId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: putReqversionSchema,
    },
    async function (request, reply) {
      const { status } = request.body;

      const { project_id, reqgroup_id } = await fastify.knex
        .from("reqversion")
        .select("requirement.project_id as project_id", "requirement.reqgroup_id as reqgroup_id")
        .where("reqversion.id", request.params.reqversionId)
        .join("requirement", "requirement.id", "reqversion.requirement_id")
        .first();

      const [{ description: desc }] = await fastify
        .knex("reqversion")
        .where("id", request.params.reqversionId)
        .update({
          status,
          updated_at: new Date(Date.now()),
          updated_by: request.user.id
        })
        .returning(["requirement_id", "description"]);

      await fastify
        .knex("reqgroup")
        .where("id", reqgroup_id)
        .update({
          updated_at: new Date(Date.now()),
          updated_by: request.user.id,
        });

      await fastify.createAlert("changeStatus", "reqversion", desc, request.params.reqversionId, project_id, request.user.id, status);
      return [status];
    }
  );

  const deleteReqversionSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        reqversionId: { type: "number" },
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
  fastify.delete(
    "/:reqversionId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: deleteReqversionSchema,
    },
    async function (request, reply) {
      const requirement = await fastify.knex
        .from("reqversion")
        .select("*", "reqversion.id as id", "requirement.id as requirement_id")
        .where("reqversion.id", request.params.reqversionId)
        .join("requirement", "requirement.id", "reqversion.requirement_id")
        .first();

      await fastify
        .knex("reqversion")
        .where("id", request.params.reqversionId)
        .del();

      await fastify.createAlert("update", "requirement", requirement.description, null, requirement.project_id, request.user.id);
      return ["success"];
    }
  );

  const getStatusHistorySchema = {
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
    response: {},
  };
  fastify.get(
    "/:reqversionId/history",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getStatusHistorySchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("alert")
        .select("alert.*", "account.name as authorName", "account.imageName as authorImageName", "alert.id as id")
        .join("account", "alert.created_by", "account.id")
        .where({ "alert.entity_reqversion_id": request.params.reqversionId })
        .orderBy("created_at", "desc");
    }
  );


  const getCommentsSchema = {
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
            created_at: { type: "string" },
          },
        },
      },
    },
  };
  fastify.get(
    "/:reqversionId/comments",
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
        .leftJoin("account", "account.id", "=", "comment.account_id")
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
    "/:reqversionId/comments",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postCommentSchema,
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

      const { slackAccessToken: token, slackMessageTs, project_id, requirement_id, description } = (
        await fastify.knex
          .from("reqversion")
          .select("reqversion.slackMessageTs", "team.slackAccessToken", "requirement.project_id", "reqversion.requirement_id", "reqversion.description")
          .join('requirement', 'requirement.id', 'reqversion.requirement_id')
          .join('project', 'project.id', 'requirement.project_id')
          .join('team', 'team.id', 'project.team_id')
          .where({
            "reqversion.id": request.params.reqversionId,
          })
          .first()
      );

      if (token) {
        const channel = await fastify.slackGetChannelId(project_id);
        await fastify.slack.chat.postMessage({
          ...JSON.parse(mrkdwn),
          token,
          channel,
          thread_ts: slackMessageTs,
          username: request.user.name,
          icon_url: request.user.imageName && `https://storage.googleapis.com/user-file-storage/${request.user.imageName}`
        });
      }

      await fastify.knex("comment").insert({
        reqversion_id: request.params.reqversionId,
        account_id: request.user.id,
        quillDelta,
        plaintext,
        html,
        mrkdwn
      });
      await fastify.createAlert("comment", "requirement", description, requirement_id, project_id, request.user.id);
      return ["success"];
    }
  );
};
