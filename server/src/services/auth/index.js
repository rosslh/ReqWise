"use strict";
const bcrypt = require("bcrypt");

module.exports = async (fastify, opts) => {
  fastify.post("/auth/token", async (request, reply) => {
    const { email, password } = request.body;
    const account = await fastify.knex
      .from("account")
      .select("password_hash", "name", "id")
      .where("email", email)
      .first();

    if (bcrypt.compareSync(password, account.password_hash)) {
      const jwtContent = { email, name: account.name, id: account.id };
      return { token: fastify.jwt.sign(jwtContent), userId: account.id };
    } else {
      reply.code(401);
      return ["Incorrect password"];
    }
  });
};
