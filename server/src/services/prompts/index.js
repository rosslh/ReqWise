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

    const postResponseSchema = {
        body: {
            type: "object",
            properties: {
                account_id: { type: ["number", "string"] }
            }
        },
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
                "Content-Type": { type: "string" },
            },
            required: ["Authorization", "Content-Type"],
        },
        response: {},
    };
    fastify.post(
        "/:promptId/responses",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember], // TODO: optional auth
            schema: postResponseSchema,
        },
        async function (request, reply) {
            const { brainstormResponseOption_id, textResponse, numericResponse } = request.body;
            const { promptId } = request.params;

            return await fastify
                .knex("account_stakeholderGroup")
                .insert({
                    account_id: request.user.id, // TODO: optional auth
                    brainstormPrompt_id: promptId,
                    brainstormResponseOption_id,
                    textResponse,
                    numericResponse,
                    ipAddress: request.ip // Trust-proxy must be true
                })
                .returning("id");
        }
    );
};
