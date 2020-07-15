module.exports = async function (fastify, opts) {
    const deletePromptSchema = {
        queryString: {},
        params: {
            type: "object",
            properties: {
                promptId: { type: "number" },
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
        "/:promptId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: deletePromptSchema,
        },
        async function (request, reply) {
            await fastify
                .knex("brainstormPrompt")
                .where("id", request.params.promptId)
                .del();
            return ["success"];
        }
    );
};
