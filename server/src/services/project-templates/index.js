module.exports = async function (fastify, opts) {
  const deleteTemplateSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        templateId: { type: "number" },
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
        maxItems: 1,
        items: { type: "string" },
      },
    },
  };
  fastify.delete(
    "/:templateId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: deleteTemplateSchema,
    },
    async function (request, reply) {
      await fastify
        .knex("projectTemplate")
        .where({
          "id": request.params.templateId
        }).del();
      return ["success"];
    }
  );
};
