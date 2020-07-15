module.exports = async function (fastify, opts) {
    const getQuestionnaireSchema = {
        queryString: {},
        params: {
            type: "object",
            properties: {
                questionnaireId: { type: "number" },
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
        "/:questionnaireId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember], // TODO: check if public
            schema: getQuestionnaireSchema,
        },
        async function (request, reply) {
            const questionnaire = await fastify.knex
                .from("brainstormForm")
                .select("*")
                .where({
                    "brainstormForm.id": request.params.questionnaireId,
                })
                .first();

            let prompts = await fastify.knex.from("brainstormPrompt").select("*").where({
                "brainstormForm_id": request.params.questionnaireId
            });

            prompts = await Promise.all(prompts.map(async p => {
                const responses = await fastify.knex.from("brainstormResponse").select("*").where({
                    "brainstormPrompt_id": p.id
                });
                const options = await fastify.knex.from("brainstormResponseOption").select("*").where({
                    "brainstormPrompt_id": p.id
                });
                return { ...p, responses, options };
            }));

            return { ...questionnaire, prompts };
        }
    );

    const postPromptSchema = {
        body: {
            type: "object",
            required: ["prompt", "type"],
            properties: {
                prompt: { type: "string" },
                type: { type: "string" },
                minVal: { type: "number" },
                maxVal: { type: "number" },
                options: { type: "array", items: { type: "string" } }
            }
        },
        queryString: {},
        params: {
            type: "object",
            properties: {
                questionnaireId: { type: "number" },
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
        "/:questionnaireId/prompts",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: postPromptSchema,
        },
        async function (request, reply) {
            const { prompt, options, minVal, maxVal, type } = request.body;
            const { questionnaireId } = request.params;

            const [id] = await fastify
                .knex("brainstormPrompt")
                .insert({
                    prompt,
                    numericFloor: minVal,
                    numericCeiling: maxVal,
                    responseType: type,
                    brainstormForm_id: questionnaireId
                })
                .returning("id");

            if (options && options.length) {
                await Promise.all(options.map(async option => {
                    await fastify
                        .knex("brainstormResponseOption")
                        .insert({
                            value: option,
                            brainstormPrompt_id: id
                        });
                }));
            }

            return ["success"];
        }
    );

    const putQuestionnaireSchema = {
        body: {
            type: "object",
            required: ["description", "is_draft", "is_open", "is_public"],
            properties: {
                description: { type: "string" },
                is_draft: { type: "boolean" },
                is_open: { type: "boolean" },
                is_public: { type: "boolean" },
            },
        },
        queryString: {},
        params: {
            type: "object",
            properties: {
                questionnaireId: { type: "number" },
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
        response: {
            200: {
                type: "object",
                properties: {
                    description: { type: "string" }
                },
            },
        },
    };

    fastify.put(
        "/:questionnaireId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: putQuestionnaireSchema,
        },
        async function (request, reply) {
            const { description, is_draft, is_open, is_public } = request.body;
            return (
                await fastify
                    .knex("brainstormForm")
                    .update({ description, is_draft, is_open, is_public })
                    .where("id", request.params.questionnaireId)
                    .returning(["description"])
            )[0];
        }
    );
};
