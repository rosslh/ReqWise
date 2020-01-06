module.exports = async function(fastify, opts) {
  /* This is a protected route */
  fastify.get(
    "/projects/:projectId",
    {
      preValidation: [fastify.authenticate]
    },
    async function(request, reply) {
      return await fastify.knex
        .from("project")
        .select("name", "team_id")
        .where("id", request.params.projectId)
        .first();
    }
  );

  fastify.get(
    "/projects/:projectId/features",
    {
      preValidation: [fastify.authenticate]
    },
    async function(request, reply) {
      return await fastify.knex
        .from("reqgroup")
        .select("reqgroup.*")
        .where("project_id", request.params.projectId);
    }
  );

  fastify.post(
    "/projects/:projectId/features",
    {
      preValidation: [fastify.authenticate]
    },
    async function(request, reply) {
      const { name } = request.body;
      const { projectId: project_id } = request.params;
      return await fastify
        .knex("reqgroup")
        .insert({
          project_id,
          name,
          type: "feature"
        })
        .returning("id");
    }
  );

  fastify.get(
    "/projects/:projectId/features/:featureId/requirements",
    {
      preValidation: [fastify.authenticate]
    },
    async function(request, reply) {
      return await fastify.knex
        .from("requirement")
        .select("*")
        .where("reqgroup_id", request.params.featureId);
    }
  );

  fastify.post(
    "/projects/:projectId/features/:featureId/requirements",
    {
      preValidation: [fastify.authenticate]
    },
    async function(request, reply) {
      const { pretty_id, description } = request.body;
      const { featureId: reqgroup_id } = request.params;
      const requirement_id = (
        await fastify
          .knex("requirement")
          .insert({
            reqgroup_id,
            pretty_id,
            description
          })
          .returning("id")
      )[0];
      await fastify
        .knex("reqversion")
        .insert({
          requirement_id,
          account_id: request.user.id,
          old_value: "",
          new_value: description
        })
        .returning("id");

      return requirement_id;
    }
  );
};
