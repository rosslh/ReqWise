const slugify = require("slugify");

module.exports = async function (fastify, opts) {
  const getProjectSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
          name: { type: "string" },
          team_id: { type: "number" },
        },
      },
    },
  };
  fastify.get(
    "/projects/:projectId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getProjectSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("project")
        .select("name", "team_id")
        .where("id", request.params.projectId)
        .first();
    }
  );

  const deleteProjectSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
    "/projects/:projectId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: { deleteProjectSchema },
    },
    async function (request, reply) {
      await fastify.knex("project").where("id", request.params.projectId).del();
      return ["success"];
    }
  );

  const getProjectFeaturesSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
            project_id: { type: "number" },
            name: { type: "string" },
            description: { type: "string" },
            pretty_id: { type: "string" },
            type: { type: "string" },
          },
        },
      },
    },
  };
  fastify.get(
    "/projects/:projectId/features",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getProjectFeaturesSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("reqgroup")
        .select("reqgroup.*")
        .where("project_id", request.params.projectId);
    }
  );

  const getArchivedSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
            reqgroup_id: { type: "number" },
            project_id: { type: "number" },
            pretty_id: { type: "string" },
            is_archived: { type: "boolean" },
          },
        },
      },
    },
  };
  fastify.get(
    "/projects/:projectId/archived",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getArchivedSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("requirement")
        .select("*")
        .where({ is_archived: true, project_id: request.params.projectId });
    }
  );

  const postFeatureSchema = {
    body: {
      type: "object",
      required: ["name", "pretty_id"],
      properties: {
        name: { type: "string" },
        pretty_id: { type: "string" },
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
        items: { type: "number" },
      },
    },
  };
  fastify.post(
    "/projects/:projectId/features",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postFeatureSchema,
    },
    async function (request, reply) {
      const { name, pretty_id } = request.body;
      const { projectId: project_id } = request.params;
      return await fastify
        .knex("reqgroup")
        .insert({
          project_id,
          name,
          type: "feature",
          pretty_id: slugify(pretty_id, { lower: true }),
        })
        .returning("id");
    }
  );
};
