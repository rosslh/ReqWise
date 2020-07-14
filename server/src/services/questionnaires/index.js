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
            return await fastify.knex
                .from("brainstormForm")
                .select("*")
                .leftJoin("brainstormPrompt", "brainstormPrompt.brainstormForm_id", "brainstormForm.id")
                .where({
                    "brainstormForm.id": request.params.questionnaireId,
                })
                .first();
        }
    );
};
