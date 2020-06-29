const Fuse = require('fuse.js');

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

            const reqgroups = await fastify.knex.from("reqgroup")
                .select(fastify.knex.raw("*, 'reqgroup' as resultType"))
                .where(`reqgroup.project_id`, projectId)
                .whereRaw(`to_tsvector('english', name || ' ' || coalesce(description, '')) @@ to_tsquery('english', '${query}')`);

            const files = await fastify.knex.from("file")
                .select(fastify.knex.raw("*, 'file' as resultType"))
                .where(`file.project_id`, projectId)
                .whereRaw(`to_tsvector('english', name || ' ' || coalesce(description, '')) @@ to_tsquery('english', '${query}')`);

            const userClasses = await fastify.knex.from("userclass")
                .select(fastify.knex.raw("*, 'userclass' as resultType"))
                .where(`userclass.project_id`, projectId)
                .whereRaw(`to_tsvector('english', name || ' ' || coalesce(description, '') || ' ' || coalesce(persona, '')) @@ to_tsquery('english', '${query}')`);

            const reqversions = await fastify.knex.from("reqversion")
                .select(fastify.knex.raw("reqversion.*, 'reqversion' as resultType"))
                .join("requirement", "reqversion.requirement_id", "requirement.id")
                .where(`requirement.project_id`, projectId)
                .where(
                    "reqversion.created_at",
                    "=",
                    fastify.knex.raw(
                        "(select max(created_at) from reqversion where reqversion.requirement_id = requirement.id)"
                    ))
                .whereRaw(`to_tsvector('english', description || ' ' || coalesce(rationale, '')) @@ to_tsquery('english', '${query}')`);

            const fuse = new Fuse([...files, ...userClasses, ...reqversions, ...reqgroups], {
                // isCaseSensitive: false,
                // includeScore: false,
                // shouldSort: true,
                // includeMatches: false,
                // findAllMatches: false,
                // minMatchCharLength: 1,
                // location: 0,
                // threshold: 0.6,
                // distance: 100,
                // useExtendedSearch: false,
                keys: ["name", "description", "rationale", "persona"]
            });

            return fuse.search(query).map(x => x.item);
        }
    );
};
