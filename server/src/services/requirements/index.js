const slugify = require("slugify");

module.exports = async function (fastify, opts) {
  const getRequirementSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        featureId: { type: "number" },
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
          latest: {
            type: "object",
            properties: {
              id: { type: "number" },
              account_id: { type: "number" },
              priority: { type: "string" },
              status: { type: "string" },
              description: { type: "string" },
              created_at: { type: "string" },
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
      const reqversion = await fastify
        .knex("reqversion")
        .where({
          requirement_id: request.params.requirementId,
        })
        .orderBy("created_at")
        .first();

      console.log(reqversion);

      const requirement = await fastify.knex
        .from("requirement")
        .join("reqgroup", "reqgroup.id", "=", "requirement.reqgroup_id")
        .select("requirement.*")
        .where({
          "requirement.id": request.params.requirementId,
        })
        .first();

      return { ...requirement, latest: reqversion };
    }
  );

  const putRequirementSchema = {
    body: {
      type: "object",
      properties: {
        pretty_id: { type: "string" },
        is_archived: { type: "boolean" },
        reqgroup_id: { type: "number" },
        project_id: { type: "number" },
      },
      required: ["pretty_id", "is_archived", "reqgroup_id", "project_id"],
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
  fastify.put(
    "/requirements/:requirementId",
    {
      preValidation: [fastify.authenticate],
      schema: putRequirementSchema,
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
          pretty_id: slugify(pretty_id, { lower: true }),
        })
        .returning("id");
    }
  );
};
