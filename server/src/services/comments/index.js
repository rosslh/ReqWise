module.exports = async function (fastify, opts) {
    const deleteCommentSchema = {
        queryString: {},
        params: {
            type: "object",
            properties: {
                commentId: { type: "number" },
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
        "/:commentId",
        {
            preValidation: [fastify.authenticate, fastify.isCommenter, fastify.isTeamMember],
            schema: deleteCommentSchema,
        },
        async function (request, reply) {
            await fastify
                .knex("comment")
                .where("id", request.params.commentId)
                .del();
            return ["success"];
        }
    );
}