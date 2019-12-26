module.exports = async function(fastify, opts) {
  /* This is a protected route */
  fastify.post(
    "/teams",
    {
      preValidation: [fastify.authenticate]
    },
    async function(request, reply) {
      const { name, description } = request.body;

      const { id: account_id } = await fastify
        .knex("account")
        .select("id")
        .where("email", request.user.email)
        .first();

      const [team_id] = await fastify
        .knex("team")
        .insert({
          name,
          description
        })
        .returning("id");

      await fastify.knex("account_team").insert({
        account_id: account_id,
        team_id,
        is_admin: true
      });

      return ["success"];
    }
  );

  fastify.get(
    "/teams",
    {
      preValidation: [fastify.authenticate]
    },
    async function(request, reply) {
      return await fastify.knex
        .from("team")
        .select("id", "name", "description");
    }
  );

  fastify.get(
    "/teams/:id",
    {
      preValidation: [fastify.authenticate]
    },
    async function(request, reply) {
      return await fastify.knex
        .from("team")
        .select("id", "name", "description")
        .where("id", request.params.id)
        .first();
    }
  );

  fastify.put(
    "/teams/:id",
    {
      preValidation: [fastify.authenticate]
    },
    async function(request, reply) {
      const { name, description } = request.body;
      if (!name || !description) {
        reply.code = 400;
        return "Missing name or description";
      }
      return await fastify
        .knex("team")
        .update({ name, description })
        .where("id", request.params.id)
        .returning(["name", "description"]);
    }
  );

  fastify.get(
    "/teams/:id/members",
    {
      preValidation: [fastify.authenticate]
    },
    async function(request, reply) {
      return await fastify.knex
        .from("account_team")
        .select(
          "account.id",
          "account.name",
          "account.email",
          "account_team.is_admin"
        )
        .where("team_id", request.params.id)
        .join("account", "account.id", "=", "account_team.account_id");
    }
  );
};
