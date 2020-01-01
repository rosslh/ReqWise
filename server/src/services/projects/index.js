module.exports = async function(fastify, opts) {
  /* This is a protected route */
  fastify.get(
    "/projects/:projectId",
    {
      preValidation: [fastify.authenticate]
    },
    async function(request, reply) {
      const id = request.params.projectId;
    }
  );
};
