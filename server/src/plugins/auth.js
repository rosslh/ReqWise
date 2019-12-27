const fp = require("fastify-plugin");

module.exports = fp(async function(fastify, opts) {
  fastify.register(require("fastify-jwt"), {
    secret: process.env.JWT_KEY
  });

  fastify.decorate("authenticate", async function(request, reply) {
    try {
      const jwtContent = await request.jwtVerify();
      const account = await fastify.knex
        .from("account")
        .select("id")
        .where("email", jwtContent.email)
        .first();
      if (jwtContent.id === account.id) {
        request.user = jwtContent;
      } else {
        throw new Error("Email and ID do not match");
      }
    } catch (err) {
      reply.send(err);
    }
  });

  fastify.decorate("isTeamAdmin", async function(request, reply) {
    try {
      if (!request.user) {
        throw new Error("Not authenticated");
      }
      if (!request.params.teamId) {
        throw new Error("Not a team route");
      }

      const isTeamAdmin = (
        await fastify.knex
          .from("account_team")
          .select("id")
          .where({
            id: request.params.teamId,
            account_id: request.user.id,
            is_admin: true
          })
      ).length;

      if (!isTeamAdmin) {
        throw new Error("Not a team administrator");
      }
    } catch (err) {
      reply.send(err);
    }
  });

  fastify.decorate("isTeamMember", async function(request, reply) {
    try {
      if (!request.user) {
        throw new Error("Not authenticated");
      }
      if (!request.params.teamId) {
        throw new Error("Not a team route");
      }

      const isTeamMember = (
        await fastify.knex
          .from("account_team")
          .select("id")
          .where({ id: request.params.teamId, account_id: request.user.id })
      ).length;

      if (!isTeamMember) {
        throw new Error("Not a team member");
      }
    } catch (err) {
      reply.send(err);
    }
  });
});
