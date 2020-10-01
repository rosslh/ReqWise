"use-strict";

module.exports = async function (fastify, opts) {
  const deleteExternalStakeholderSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        externalStakeholderId: { type: "number" },
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
    "/:externalStakeholderId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: deleteExternalStakeholderSchema,
    },
    async function (request, reply) {
      const { account_id } = await fastify.knex
        .from("stakeholder_project")
        .select("account_id")
        .where({ id: request.params.externalStakeholderId })
        .first();
      await fastify.knex("account_stakeholderGroup").where({ account_id }).del();
      await fastify
        .knex("stakeholder_project")
        .where({ "id": request.params.externalStakeholderId })
        .del();
      return ["success"];
    }
  );
};
