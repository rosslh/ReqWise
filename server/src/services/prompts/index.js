module.exports = async function (fastify, opts) {
  const deletePromptSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        promptId: { type: "number" },
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
    "/:promptId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: deletePromptSchema,
    },
    async function (request, reply) {
      await fastify
        .knex("brainstormPrompt")
        .where("id", request.params.promptId)
        .del();
      return ["success"];
    }
  );

  const postResponseSchema = {
    body: {
      type: "object",
      properties: {
        optionId: { type: ["number", "string"] },
        textResponse: { type: "string" },
        numericResponse: { type: "number" }
      }
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        promptId: { type: "number" },
      },
    },
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" },
        "Content-Type": { type: "string" },
      },
      required: ["Authorization", "Content-Type"],
    },
    response: {},
  };
  fastify.post(
    "/:promptId/responses",
    {
      preValidation: [fastify.allowAnonIfPublic],
      schema: postResponseSchema,
    },
    async function (request, reply) {
      let { optionId, textResponse, numericResponse } = request.body;

      if (![optionId || textResponse || numericResponse].some(x => typeof x !== "undefined")) {
        reply.code(400);
        return "Missing response value";
      }

      if (optionId) {
        optionId = fastify.deobfuscateId(optionId);
      }

      const { promptId } = request.params;

      const { is_draft, is_open } = await fastify.knex
        .from("brainstormPrompt")
        .select("*")
        .join("brainstormForm", "brainstormForm.id", "brainstormPrompt.brainstormForm_id")
        .where("brainstormPrompt.id", request.params.promptId).first();

      if (is_draft || !is_open) {
        reply.code(400);
        return "Questionnaire is not open for responses";
      }

      const alreadyResponded = (
        await fastify.knex
          .from("brainstormResponse")
          .select("id")
          .where({
            brainstormPrompt_id: promptId,
            ...(request.user && { account_id: request.user.id }),
            ...(!(request.user && request.user.id) && { ipAddress: request.ip })
          })
      ).length;

      if (alreadyResponded) {
        reply.code(400);
        return "Already responded";
      }

      const [id] = await fastify
        .knex("brainstormResponse")
        .insert({
          brainstormPrompt_id: promptId,
          brainstormResponseOption_id: optionId,
          textResponse,
          numericResponse,
          ...(request.user && { account_id: request.user.id }), // Can be anonymous
          ...(!(request.user && request.user.id) && { ipAddress: request.ip }) // Trust-proxy must be true
        })
        .returning("id");

      await fastify.knex("brainstormReaction").insert({
        brainstormResponse_id: id,
        reactionType: "upvote",
        ...(request.user && { account_id: request.user.id }), // Can be anonymous
        ...(!(request.user && request.user.id) && { ipAddress: request.ip }) // Trust-proxy must be true
      }); // users upvote their own answers by default

      return [id];
    }
  );

  const getPromptSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        promptId: { type: "number" },
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
    "/:promptId",
    {
      preValidation: [fastify.allowAnonIfPublic],
      schema: getPromptSchema,
    },
    async function (request, reply) {
      let prompt = await fastify.knex.from("brainstormPrompt").select("*").where({
        "id": request.params.promptId
      }).first();

      return fastify.getPromptDetails(prompt, request);
    });

  const getReqversion = function () {
    this.on("requirement.id", "=", "reqversion.requirement_id").andOn(
      "reqversion.created_at",
      "=",
      fastify.knex.raw(
        "(select max(created_at) from reqversion where reqversion.requirement_id = requirement.id)"
      )
    );
  };
  const getPromptRequirementsSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        promptId: { type: "number" },
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
    "/:promptId/requirements",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getPromptRequirementsSchema,
    },
    async function (request, reply) {
      const requirements = await fastify.knex
        .from("requirement")
        .select("requirement.*", "reqversion.*", "per_project_unique_id.readable_id as ppuid", "requirement.id as id") // id overwrite must be at end
        .select(fastify.knex.raw("'requirement' as \"entityType\""))
        .join("reqversion", getReqversion)
        .join("per_project_unique_id", "per_project_unique_id.id", "requirement.ppuid_id")
        .join("brainstormPrompt_requirement", "requirement.id", "brainstormPrompt_requirement.requirement_id")
        .where({ "brainstormPrompt_requirement.brainstormPrompt_id": request.params.promptId })
        .orderBy("ppuid", "asc");

      const reqgroups = await fastify.knex
        .from("reqgroup")
        .select("reqgroup.*", "per_project_unique_id.readable_id as ppuid", "reqgroup.id as id") // id overwrite must be at end
        .select(fastify.knex.raw("'reqgroup' as \"entityType\""))
        .join("per_project_unique_id", "per_project_unique_id.id", "reqgroup.ppuid_id")
        .join("brainstormPrompt_reqgroup", "reqgroup.id", "brainstormPrompt_reqgroup.reqgroup_id")
        .where({ "brainstormPrompt_reqgroup.brainstormPrompt_id": request.params.promptId })
        .orderBy("ppuid", "asc");

      return [...requirements, ...reqgroups].sort((a, b) => Number(a.ppuid) - Number(b.ppuid));
    }
  );

  const deletePromptRequirementSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        promptId: { type: "number" },
        requirementId: { type: "number" },
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
    "/:promptId/requirements/:requirementId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: deletePromptRequirementSchema,
    },
    async function (request, reply) {
      await fastify
        .knex("brainstormPrompt_requirement")
        .where({
          "brainstormPrompt_id": request.params.promptId,
          "requirement_id": request.params.requirementId,
        }).del();
      return ["success"];
    }
  );

  const deletePromptReqgroupSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        promptId: { type: "number" },
        requirementId: { type: "number" },
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
    "/:promptId/reqgroups/:reqgroupId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: deletePromptReqgroupSchema,
    },
    async function (request, reply) {
      await fastify
        .knex("brainstormPrompt_reqgroup")
        .where({
          "brainstormPrompt_id": request.params.promptId,
          "reqgroup_id": request.params.reqgroupId,
        }).del();
      return ["success"];
    }
  );
};
