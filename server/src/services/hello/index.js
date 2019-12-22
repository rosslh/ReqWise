module.exports = async function(fastify, opts) {
  /* This is a protected route */
  fastify.get(
    "/hello",
    {
      preValidation: [fastify.authenticate]
    },
    async function(request, reply) {
      return request.user;
    }
  );
};
