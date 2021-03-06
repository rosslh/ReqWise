"use strict";
const bcrypt = require("bcrypt");

module.exports = async (fastify, opts) => {
  const postTokenSchema = {
    body: {
      type: "object",
      properties: {
        email: { type: "string" },
        password: { type: "string" },
      },
      required: ["email", "password"],
    },
    queryString: {},
    params: {},
    headers: {
      type: "object",
      properties: {
        "Content-Type": { type: "string" },
      },
      required: ["Content-Type"],
    },
    response: {
      200: {
        type: "object",
        properties: {
          token: { type: "string" },
          userId: { type: "string" },
          theme: { type: "string" },
          imageName: { type: "string" },
          doneProjectTour: { type: "boolean" },
          doneTeamTour: { type: "boolean" },
        },
      },
      401: {
        type: "array",
        items: { type: "string" },
        maxItems: 1,
      },
    },
  };
  fastify.post(
    "/token",
    { schema: postTokenSchema },
    async (request, reply) => {
      const { email, password } = request.body;
      const account = await fastify.knex
        .from("account")
        .select("password_hash", "name", "id", "is_verified", "theme", "imageName", "doneProjectTour", "doneTeamTour")
        .where("email", email.toLowerCase())
        .first();

      if (!account.is_verified) {
        reply.code(403);
        return ["Account is not verified"];
      }

      if (bcrypt.compareSync(password, account.password_hash)) {
        const jwtContent = { email: email.toLowerCase(), name: account.name, id: account.id, imageName: account.imageName, doneProjectTour: account.doneProjectTour, doneTeamTour: account.doneTeamTour };
        return {
          token: fastify.jwt.sign(jwtContent),
          userId: fastify.obfuscateId(account.id),
          theme: account.theme,
          imageName: account.imageName,
          doneProjectTour: account.doneProjectTour,
          doneTeamTour: account.doneTeamTour,
        };
      } else {
        reply.code(401);
        return ["Incorrect password"];
      }
    }
  );
};
