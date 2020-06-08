module.exports = async function (fastify, opts) {
    const postStakeholderSchema = {
        body: {},
        queryString: {},
        params: {
            type: "object",
            properties: {
                stakeholderGroupId: { type: "number" },
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
                    team_id: { type: "number" },
                },
            },
        },
    };
    fastify.post(
        "/stakeholders/:stakeholderGroupId/users",
        {
            preValidation: [fastify.authenticate],
            schema: postStakeholderSchema,
        },
        async function (request, reply) {
            // fetch
        }
    );
};
