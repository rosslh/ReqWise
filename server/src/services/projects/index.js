const slugify = require("slugify");

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

  fastify.delete(
    "/projects/:projectId",
    {
      preValidation: [fastify.authenticate]
    },
    async function(request, reply) {
      await fastify
        .knex("project")
        .where("id", request.params.projectId)
        .del();
      return ["success"];
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
      const { name, pretty_id } = request.body;
      const { projectId: project_id } = request.params;
      return await fastify
        .knex("reqgroup")
        .insert({
          project_id,
          name,
          type: "feature",
          pretty_id: slugify(pretty_id, { lower: true })
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
        .where("reqgroup_id", request.params.featureId)
        .join("reqversion", function() {
          this.on("requirement.id", "=", "reqversion.requirement_id").andOn(
            "reqversion.created_at",
            "=",
            fastify.knex.raw(
              "(select max(created_at) from reqversion where reqversion.requirement_id = requirement.id)"
            )
          );
        });
    }
  );

  fastify.post(
    "/projects/:projectId/features/:featureId/requirements",
    {
      preValidation: [fastify.authenticate]
    },
    async function(request, reply) {
      const { pretty_id, description, priority, status } = request.body;
      const { featureId: reqgroup_id } = request.params;
      const requirement_id = (
        await fastify
          .knex("requirement")
          .insert({
            reqgroup_id,
            pretty_id: slugify(pretty_id, { lower: true })
          })
          .returning("id")
      )[0];
      await fastify
        .knex("reqversion")
        .insert({
          requirement_id,
          account_id: request.user.id,
          description,
          priority,
          status
        })
        .returning("id");

      return requirement_id;
    }
  );
};
