const { randomBytes } = require('crypto');
const { generateFromString } = require('generate-avatar');

module.exports = async function (fastify, opts) {
  const getQuestionnaireSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        questionnaireId: { type: "number" },
      },
    },
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" },
      },
      required: [],
    },
    response: {},
  };
  fastify.get(
    "/:questionnaireId",
    {
      preValidation: [fastify.allowAnonIfPublic],
      schema: getQuestionnaireSchema,
    },
    async function (request, reply) {
      const questionnaire = await fastify.knex
        .from("brainstormForm")
        .select("*")
        .where({
          "brainstormForm.id": request.params.questionnaireId,
        })
        .first();

      let prompts = await fastify.knex.from("brainstormPrompt").select("*").where({
        "brainstormForm_id": request.params.questionnaireId
      });

      prompts = await Promise.all(prompts.map(async p => await fastify.getPromptDetails(p, request)));

      return { ...questionnaire, prompts };
    }
  );

  const postPromptSchema = {
    body: {
      type: "object",
      required: ["prompt", "type"],
      properties: {
        prompt: { type: "string" },
        type: { type: "string" },
        minVal: { type: "number" },
        maxVal: { type: "number" },
        options: { type: "array", items: { type: "string" } }
      }
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        questionnaireId: { type: "number" },
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
    "/:questionnaireId/prompts",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postPromptSchema,
    },
    async function (request, reply) {
      const { prompt, options, minVal, maxVal, type } = request.body;
      const { questionnaireId } = request.params;

      const { project_id } = await fastify.knex
        .from("brainstormForm")
        .select("*")
        .where("id", request.params.questionnaireId)
        .first();

      const { id: ppuid_id } = await fastify.getNewPpuid(project_id);

      const [id] = await fastify
        .knex("brainstormPrompt")
        .insert({
          prompt,
          numericFloor: minVal,
          numericCeiling: maxVal,
          responseType: type,
          brainstormForm_id: questionnaireId,
          ppuid_id
        })
        .returning("id");

      if (options && options.length) {
        await Promise.all(options.map(async option => {
          await fastify
            .knex("brainstormResponseOption")
            .insert({
              value: option,
              brainstormPrompt_id: id
            });
        }));
      }

      return ["success"];
    }
  );

  const putQuestionnaireSchema = {
    body: {
      type: "object",
      required: ["description", "is_draft", "is_open", "is_public"],
      properties: {
        description: { type: "string" },
        is_draft: { type: "boolean" },
        is_open: { type: "boolean" },
        is_public: { type: "boolean" },
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        questionnaireId: { type: "number" },
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
    response: {
      200: {
        type: "object",
        properties: {
          description: { type: "string" }
        },
      },
    },
  };

  fastify.put(
    "/:questionnaireId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: putQuestionnaireSchema,
    },
    async function (request, reply) {
      const { description, is_draft, is_open, is_public } = request.body;
      await fastify
        .knex("brainstormForm")
        .update({ description, is_draft, is_open, is_public })
        .where("id", request.params.questionnaireId)
        .returning("id");

      return { description };
    }
  );

  const postInviteSchema = {
    body: {
      type: "object",
      required: ["inviteeEmail"],
      properties: {
        inviteeEmail: { type: "string" },
      }
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        questionnaireId: { type: "number" },
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
    "/:questionnaireId/invites",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postInviteSchema,
    },
    async function (request, reply) {
      let { inviteeEmail } = request.body;
      const { questionnaireId } = request.params;

      inviteeEmail = inviteeEmail.toLowerCase();

      await fastify
        .knex("brainstormInvite")
        .insert({
          inviteeEmail,
          inviter_id: request.user.id,
          brainstormForm_id: questionnaireId
        })
        .returning("id");

      const accountAlreadyExists = (
        await fastify.knex
          .from("account")
          .select("account.id")
          .where({
            email: inviteeEmail
          })
      ).length;

      const { project_id } = await fastify.knex.from("brainstormForm").select("*").where({ id: questionnaireId }).first();

      const href = `https://reqwise.com/login?redirect=%2Fpublic-form%2F${fastify.obfuscateId(questionnaireId)}`;

      if (accountAlreadyExists) {
        await fastify.sendEmail(
          inviteeEmail,
          `You are invited to respond to a questionnaire. Sign in to get started: ${href}`,
          "You are invited to respond to a questionnaire",
          'brainstorm-invite-existing-user',
          { href }
        );
      }
      else {
        const verification_token = randomBytes(32).toString('hex');
        const placeholderImage = generateFromString(inviteeEmail);
        await fastify
          .knex("account")
          .insert({
            email: inviteeEmail.toLowerCase(),
            verification_token,
            is_verified: false,
            placeholderImage
          })
          .returning("id");

        const href = `https://reqwise.com/sign-up/complete?token=${encodeURIComponent(
          verification_token
        )}&email=${encodeURIComponent(inviteeEmail)}`;


        await fastify.sendEmail(
          inviteeEmail,
          `You are invited to respond to a questionnaire. Create an account to get started: ${href}`,
          "You are invited to respond to a questionnaire",
          'brainstorm-invite-new-user',
          { href }
        );
      }

      await fastify
        .knex("stakeholderInvite")
        .insert({
          inviteeEmail,
          inviter_id: request.user.id,
          project_id
        });

      return ["success"]
    }
  );
};
