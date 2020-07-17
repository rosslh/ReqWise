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
            preValidation: [fastify.allowAnonIfPublic],
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
            preValidation: [fastify.allowAnonIfPublic],
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

            const [id] = await fastify
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

            await fastify.knex("brainstormReaction").insert({
                brainstormResponse_id: id,
                reactionType: "upvote",
                ...(request.user && { account_id: request.user.id }), // Can be anonymous
                ipAddress: request.ip // Trust-proxy must be true
            }); // users upvote their own answers by default

            return [id];
        }
    );

    const getPromptSchema = {
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
        response: {},
    };
    fastify.get(
        "/:promptId",
        {
            preValidation: [fastify.allowAnonIfPublic],
            schema: getPromptSchema,
        },
        async function (request, reply) {
            let prompt = await fastify.knex.from("brainstormPrompt").select("*").where({
                "id": request.params.promptId
            }).first();

            let responses = await fastify.knex.from("brainstormResponse").select("*").where({
                "brainstormPrompt_id": request.params.promptId
            });

            responses = await Promise.all(responses.map(async r => {
                const reactions = await fastify.knex.from("brainstormReaction").select("*").where({
                    brainstormResponse_id: r.id
                });

                const yourReaction = request.user && request.user.id
                    ? reactions.find(x => x.account_id === request.user.id)
                    : reactions.find(x => x.ipAddress === request.ip);

                const upvotes = reactions.filter(x => x.reactionType === "upvote").length;
                const downvotes = reactions.filter(x => x.reactionType === "downvote").length;

                return { ...r, reactions, upvotes, downvotes, yourReaction };
            }));

            const options = await fastify.knex.from("brainstormResponseOption").select("*").where({
                "brainstormPrompt_id": request.params.promptId
            });

            const yourResponse = request.user && request.user.id
                ? responses.find(x => x.account_id === request.user.id)
                : responses.find(x => x.ipAddress === request.ip);

            return { ...prompt, responses, options, yourResponse };
        });
};
