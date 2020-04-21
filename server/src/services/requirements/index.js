const slugify = require("slugify");

module.exports = async function (fastify, opts) {
  const getRequirementSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
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
        type: "object",
        properties: {
          id: { type: "number" },
          reqgroup_id: { type: "number" },
          project_id: { type: "number" },
          is_archived: { type: "boolean" },
          pretty_id: { type: "string" },
          comments: {
            type: "array",
            items: {
              type: "object",
              properties: {},
            },
          },
          latestVersion: {
            type: "object",
            properties: {
              id: { type: "number" },
              account_id: { type: "number" },
              priority: { type: "string" },
              status: { type: "string" },
              description: { type: "string" },
              created_at: { type: "string" },
              rationale: { type: "string" },
            },
          },
          previousVersion: {
            type: "object",
            properties: {
              id: { type: "number" },
              account_id: { type: "number" },
              priority: { type: "string" },
              status: { type: "string" },
              description: { type: "string" },
              created_at: { type: "string" },
              rationale: { type: "string" },
            },
          },
        },
      },
    },
  };
  fastify.get(
    "/requirements/:requirementId",
    {
      preValidation: [fastify.authenticate],
      schema: getRequirementSchema,
    },
    async function (request, reply) {
      // TODO: check if team member
      const versions = await fastify
        .knex("reqversion")
        .where({
          requirement_id: request.params.requirementId,
        })
        .orderBy("created_at", "desc")
        .limit(2);

      const latestVersion = versions[0];

      const previousVersion = versions.length === 2 ? versions[1] : {};

      const requirement = await fastify.knex
        .from("requirement")
        .join("reqgroup", "reqgroup.id", "=", "requirement.reqgroup_id")
        .select("requirement.*")
        .where({
          "requirement.id": request.params.requirementId,
        })
        .first();

      return { ...requirement, latestVersion, previousVersion, comments: [] };
    }
  );

  const deleteRequirementSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
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
    "/requirements/:requirementId",
    {
      preValidation: [fastify.authenticate],
      schema: deleteRequirementSchema,
    },
    async function (request, reply) {
      await fastify
        .knex("requirement")
        .where("id", request.params.requirementId)
        .del();
      return ["success"];
    }
  );

  const patchRequirementSchema = {
    body: {
      type: "object",
      properties: {
        pretty_id: { type: "string" },
        is_archived: { type: "boolean" },
        reqgroup_id: { type: "number" },
        project_id: { type: "number" },
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        requirementId: { type: "number" },
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
    response: {
      200: {
        type: "array",
        maxItems: 1,
        items: { type: "number" },
      },
    },
  };
  fastify.patch(
    "/requirements/:requirementId",
    {
      preValidation: [fastify.authenticate],
      schema: patchRequirementSchema,
    },
    async function (request, reply) {
      const { pretty_id, project_id, reqgroup_id, is_archived } = request.body;
      return await fastify
        .knex("requirement")
        .where("id", request.params.requirementId)
        .update({
          project_id,
          reqgroup_id,
          is_archived,
          pretty_id: pretty_id && slugify(pretty_id, { lower: true }),
        })
        .returning("id");
    }
  );

  const postReqVersionSchema = {
    body: {
      type: "object",
      properties: {
        priority: { type: "string" },
        status: { type: "string" },
        description: { type: "string" },
        rationale: { type: "string" },
      },
      required: ["rationale"],
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
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
        type: "number",
      },
    },
  };
  fastify.post(
    "/requirements/:requirementId/versions",
    {
      preValidation: [fastify.authenticate],
      schema: postReqVersionSchema,
    },
    async function (request, reply) {
      const { description, priority, status, rationale } = request.body;
      const { requirementId: requirement_id } = request.params;

      const latestVersion = await fastify
        .knex("reqversion")
        .select(["description", "priority", "status", "requirement_id"])
        .where({
          requirement_id: request.params.requirementId, // TODO: exclude status: proposed
        })
        .orderBy("created_at", "desc")
        .first();

      const newVersion = {
        ...latestVersion,
        account_id: request.user.id,
        ...(priority && { priority }), // Only update priority if defined
        ...(description && { description }),
        ...(status && { status }),
        rationale,
        requirement_id,
      };

      await fastify.knex("reqversion").insert(newVersion).returning("id");

      return requirement_id;
    }
  );
};
