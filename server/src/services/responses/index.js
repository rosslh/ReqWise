module.exports = async function (fastify, opts) {
    const postReactionSchema = {
        body: {
            type: "object",
            properties: {
                reactionType: { type: "string" }
            }
        },
        queryString: {},
        params: {
            type: "object",
            properties: {
                responseId: { type: "number" },
            },
        },
        headers: {
            type: "object",
            properties: {
                Authorization: { type: "string" },
                "Content-Type": { type: "string" },
            },
            required: ["Authorization", "Content-Type"],
        },
        response: {},
    };
    fastify.post(
        "/:responseId/reactions",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember], // TODO: optional auth
            schema: postReactionSchema,
        },
        async function (request, reply) {
            let { reactionType } = request.body;
            const { responseId } = request.params;

            const alreadyResponded = (
                await fastify.knex
                    .from("brainstormReaction")
                    .select("id")
                    .where({
                        brainstormResponse_id: responseId,
                        ...(request.user && { account_id: request.user.id }),
                        ...(!(request.user && request.user.id) && { ipAddress: request.ip })
                    })
            ).length;

            if (alreadyResponded) {
                reply.code(400);
                return "Already reacted";
            }

            return await fastify
                .knex("brainstormReaction")
                .insert({
                    brainstormResponse_id: responseId,
                    reactionType,
                    ...(request.user && { account_id: request.user.id }), // Can be anonymous
                    ipAddress: request.ip // Trust-proxy must be true
                })
                .returning("id");
        }
    );
};
