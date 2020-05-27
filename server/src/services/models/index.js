module.exports = async function (fastify, opts) {
    const getModelSchema = {
        body: {},
        queryString: {},
        params: {
            type: "object",
            properties: {
                modelId: { type: "number" },
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
                    id: { type: "number" },
                    name: { type: "string" },
                    description: { type: "string" },
                    svg: { type: "string" },
                },
            },
        },
    };
    fastify.get(
        "/models/:modelId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: getModelSchema,
        },
        async function (request, reply) {
            return await fastify.knex
                .from("model")
                .select("*")
                .where({
                    id: request.params.modelId,
                })
                .first();
        }
    );

};
