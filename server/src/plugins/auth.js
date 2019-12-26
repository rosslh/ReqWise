const fp = require("fastify-plugin");

module.exports = fp(async function(fastify, opts) {
  fastify.register(require("fastify-jwt"), {
    secret: process.env.JWT_KEY
  });

  fastify.decorate("authenticate", async function(request, reply) {
    try {
      request.user = await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
});
