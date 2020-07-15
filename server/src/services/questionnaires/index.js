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
            preValidation: [fastify.authenticate, fastify.isTeamMember],
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

            const prompts = await fastify.knex.from("brainstormPrompt").select("*").where({
                "brainstormForm_id": request.params.questionnaireId
            });

            return { ...questionnaire, prompts };
        }
    );

    const postStakeholderSchema = {
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
            schema: postStakeholderSchema,
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
};
