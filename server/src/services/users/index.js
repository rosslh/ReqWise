"use strict";
const bcrypt = require("bcrypt");

module.exports = async (fastify, opts) => {
  // Create a user
  fastify.post("/users", async (request, reply) => {
    const { name, email, password } = request.body;
    return await fastify
      .knex("account")
      .insert({
        name,
        email,
        password_hash: bcrypt.hashSync(password, 10)
      })
      .returning("id");
  });

  // Update one user
  fastify.put(
    "/users/:id",
    {
      preValidation: [fastify.authenticate]
    },
    async function(request, reply) {
      const { name, email } = request.body;
      if (!name || !email) {
        reply.code = 400;
        return "Missing name or email";
      }
      return await fastify
        .knex("account")
        .update({ name, email })
        .where("id", request.params.id)
        .returning(["name", "email"]);
    }
  );

  // Get one user
  fastify.get(
    "/users/:id",
    {
      preValidation: [fastify.authenticate]
    },
    async function(request, reply) {
      return await fastify
        .knex("account")
        .select("name")
        .where("id", request.params.id)
        .first();
    }
  );

  // Get a user's teams
  fastify.get(
    "/users/:id/teams",
    {
      preValidation: [fastify.authenticate]
    },
    async function(request, reply) {
      return await fastify
        .knex("account_team")
        .select(
          "team.id",
          "team.name",
          "team.description",
          "account_team.is_admin"
        )
        .where("account_id", request.params.id)
        .join("team", "team.id", "=", "account_team.team_id");
    }
  );
};
