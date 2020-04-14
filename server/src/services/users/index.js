"use strict";
const bcrypt = require("bcrypt");

module.exports = async (fastify, opts) => {
  // Create a user
  // fastify.post("/users", async (request, reply) => {
  //     const { name, email, password } = request.body;
  //     return await fastify
  //         .knex("account")
  //         .insert({
  //             name,
  //             email,
  //             password_hash: bcrypt.hashSync(password, 10)
  //         })
  //         .returning("id");
  // });

  // Update one user
  const putUserSchema = {
    body: {
      type: "object",
      required: ["name", "email", "password"],
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        password: { type: "string" },
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        id: { type: "number" },
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
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
        },
      },
    },
  };
  fastify.put(
    "/users/:id",
    {
      preValidation: [fastify.authenticate], //, fastify.isCorrectUser]
      schema: putUserSchema,
    },
    async function (request, reply) {
      const { name, email, password } = request.body;
      if (!name || !email || !password) {
        reply.code = 400;
        return "Missing name, email, or password";
      }
      return (
        await fastify
          .knex("account")
          .update({ name, email, password_hash: bcrypt.hashSync(password, 10) })
          .where("id", request.params.id)
          .returning(["name", "email"])
      )[0];
    }
  );

  const getUserSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        id: { type: "number" },
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
          email: { type: "string" },
        },
      },
    },
  };
  // Get one user
  fastify.get(
    "/users/:id",
    {
      preValidation: [fastify.authenticate], //, fastify.isCorrectUser],
      schema: getUserSchema,
    },
    async function (request, reply) {
      return await fastify
        .knex("account")
        .select("name", "email")
        .where("id", request.params.id)
        .first();
    }
  );

  const getTeamsSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        id: { type: "number" },
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
            name: { type: "string" },
            description: { type: "string" },
            is_admin: { type: "boolean" },
          },
        },
      },
    },
  };
  // Get a user's teams
  fastify.get(
    "/users/:id/teams",
    {
      preValidation: [fastify.authenticate], //, fastify.isCorrectUser]
      schema: getTeamsSchema,
    },
    async function (request, reply) {
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
