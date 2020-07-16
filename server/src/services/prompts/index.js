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

            const alreadyResponded = (
                await fastify.knex
                    .from("brainstormResponse")
                    .select("id")
                    .where({
                        brainstormPrompt_id: promptId,
                        ...(request.user && { account_id: request.user.id }),
                        ...(!(request.user && request.user.id) && { ipAddress: request.ip })
                    })
            ).length;

            if (alreadyResponded) {
                reply.code(400);
                return "Already responded";
            }

            return await fastify
                .knex("brainstormResponse")
                .insert({
                    brainstormPrompt_id: promptId,
                    brainstormResponseOption_id: optionId,
                    textResponse,
                    numericResponse,
                    ...(request.user && { account_id: request.user.id }), // Can be anonymous
                    ipAddress: request.ip // Trust-proxy must be true
                })
                .returning("id");
        }
    );
};
