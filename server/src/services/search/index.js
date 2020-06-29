module.exports = async function (fastify, opts) {
    const getSearchResultsSchema = {
        body: {},
        queryString: {},
        params: {
            type: "object",
            properties: {
                projectId: { type: "number" },
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
        "/projects/:projectId/search",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: getSearchResultsSchema,
        },
        async function (request, reply) {
            const query = request.query.q;
            const { projectId } = request.params;

            console.log(query, projectId);

            return await fastify.knex.from("reqgroup")
                .select('*')
                .where(`reqgroup.project_id`, projectId)
                .whereRaw(`to_tsvector('english', name || ' ' || coalesce(description, '')) @@ to_tsquery('english', '${query}')`);
        }
    );
};
