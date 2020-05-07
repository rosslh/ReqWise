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

  const getProjectReqgroupsSchema = {
    body: {},
    queryString: {
      type: "object",
      properties: {
        type: { type: "string" },
      },
    },
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
            ppuid: { type: "number" },
            type: { type: "string" },
            isDeletable: { type: "boolean" },
            isMaxOneRequirement: { type: "boolean" },
            isPrioritized: { type: "boolean" }
          },
        },
      },
    },
  };
  fastify.get(
    "/projects/:projectId/reqgroups",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getProjectReqgroupsSchema,
    },
    async function (request, reply) {
      const { type } = request.query;
      return await fastify.knex
        .from("reqgroup")
        .select("*", "per_project_unique_id as ppuid")
        .where({ project_id: request.params.projectId, type });
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
            ppuid: { type: "number" },
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
        .select("*", "per_project_unique_id as ppuid")
        .where({ is_archived: true, project_id: request.params.projectId });
    }
  );

  const capitalizeFirstLetter = str => str.charAt(0).toUpperCase() + str.slice(1);

  const postReqgroupSchema = {
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
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
    "/projects/:projectId/reqgroups",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postReqgroupSchema,
    },
    async function (request, reply) {
      const { name, type } = request.body;
      const { projectId: project_id } = request.params;
      const maxPpuid =
        (
          await fastify
            .knex("reqgroup")
            .where({ project_id })
            .max("per_project_unique_id")
            .first()
        ).max || 0;

      await fastify.knex("project").where({ id: project_id }).update({ reqgroups_updated_at: new Date(Date.now()) });

      return await fastify
        .knex("reqgroup")
        .insert({
          project_id,
          name: capitalizeFirstLetter(name),
          type,
          per_project_unique_id: maxPpuid + 1,
          created_by: request.user.id,
          updated_by: request.user.id,
        })
        .returning("id");
    }
  );
};
