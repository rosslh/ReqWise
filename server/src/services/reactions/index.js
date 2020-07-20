module.exports = async function (fastify, opts) {
    const deletePromptSchema = {
        queryString: {},
        params: {
            type: "object",
            properties: {
                reactionId: { type: "number" },
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
        "/:reactionId",
        {
            preValidation: [fastify.allowAnonIfPublic], // TODO: check if same user as reaction
            schema: deletePromptSchema,
        },
        async function (request, reply) {
            await fastify
                .knex("brainstormReaction")
                .where("id", request.params.reactionId)
                .del();
            return ["success"];
        }
    );
};