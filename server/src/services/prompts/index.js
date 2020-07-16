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
                optionId: { type: ["number", "string"] },
                textResponse: { type: "string" },
                numericResponse: { type: "number" }
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
            let { optionId, textResponse, numericResponse } = request.body;

            if (![optionId || textResponse || numericResponse].some(x => typeof x !== "undefined")) {
                reply.code(400);
                return "Missing response value";
            }

            if (optionId) {
                optionId = fastify.deobfuscateId(optionId);
            }

            const { promptId } = request.params;

            return await fastify
                .knex("brainstormResponse")
                .insert({
                    account_id: request.user.id, // TODO: optional auth
                    brainstormPrompt_id: promptId,
                    brainstormResponseOption_id: optionId,
                    textResponse,
                    numericResponse,
                    ipAddress: request.ip // Trust-proxy must be true
                })
                .returning("id");
        }
    );
};
