"use strict";
const bcrypt = require("bcrypt");

module.exports = async (fastify, opts) => {
  fastify.post("/auth/user", async (request, reply) => {
    const { username, email, password } = request.body;
    return await fastify
      .knex("account")
      .insert({
        username,
        email,
        password_hash: bcrypt.hashSync(password, 10)
      })
      .returning("id");
  });

  fastify.post("/auth/token", async (request, reply) => {
    const { email, password } = request.body;

    const account = await fastify.knex
      .from("account")
      .select("password_hash", "username")
      .where("email", email)
      .first();

    if (bcrypt.compareSync(password, account.password_hash)) {
      return fastify.jwt.sign(
        { email, username: account.username },
        process.env.JWT_KEY
      );
    } else {
      reply.code(401);
      return ["Incorrect password"];
    }
  });
};
