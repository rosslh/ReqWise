const Fuse = require('fuse.js');

module.exports = async function (fastify, opts) {
  const getSearchResultsSchema = {
    queryString: {
      type: "object",
      properties: {
        q: { type: "string" }
      }
    },
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
    "/:projectId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getSearchResultsSchema,
    },
    async function (request, reply) {
      const query = request.query.q.trim().replace(/ /g, " & "); // https://www.postgresql.org/docs/9.2/textsearch-intro.html
      const { projectId } = request.params;

      const reqgroups = await fastify.knex.from("reqgroup")
        .select(fastify.knex.raw("*, 'requirement group' as result_type, per_project_unique_id.readable_id as ppuid, reqgroup.id as id"))
        .join("per_project_unique_id", "per_project_unique_id.id", "reqgroup.ppuid_id")
        .where(`reqgroup.project_id`, projectId)
        .whereRaw(`to_tsvector('english', name || ' ' || coalesce(description, '')) @@ to_tsquery('english', '${query}')`);

      const files = await fastify.knex.from("file")
        .select(fastify.knex.raw("*, 'file' as result_type, per_project_unique_id.readable_id as ppuid, file.id as id"))
        .join("per_project_unique_id", "per_project_unique_id.id", "file.ppuid_id")
        .where(`file.project_id`, projectId)
        .whereRaw(`to_tsvector('english', name || ' ' || coalesce(description, '')) @@ to_tsquery('english', '${query}')`);

      const userClasses = await fastify.knex.from("userclass")
        .select(fastify.knex.raw("*, 'user class' as result_type, per_project_unique_id.readable_id as ppuid, userclass.id as id"))
        .join("per_project_unique_id", "per_project_unique_id.id", "userclass.ppuid_id")
        .where(`userclass.project_id`, projectId)
        .whereRaw(`to_tsvector('english', name || ' ' || coalesce(description, '') || ' ' || coalesce(persona, '')) @@ to_tsquery('english', '${query}')`);

      const stakeholderGroups = await fastify.knex.from("stakeholderGroup")
        .select(fastify.knex.raw("*, 'stakeholder group' as result_type, per_project_unique_id.readable_id as ppuid, \"stakeholderGroup\".id as id"))
        .join("per_project_unique_id", "per_project_unique_id.id", "stakeholderGroup.ppuid_id")
        .where(`stakeholderGroup.project_id`, projectId)
        .whereRaw(`to_tsvector('english', name || ' ' || coalesce(description, '')) @@ to_tsquery('english', '${query}')`);


      const reqversions = await fastify.knex.from("reqversion")
        .select(fastify.knex.raw("reqversion.*, 'requirement' as result_type, per_project_unique_id.readable_id as ppuid"))
        .join("requirement", "reqversion.requirement_id", "requirement.id")
        .join("per_project_unique_id", "per_project_unique_id.id", "requirement.ppuid_id")
        .where(`requirement.project_id`, projectId)
        .where(
          "reqversion.created_at",
          "=",
          fastify.knex.raw(
            "(select max(created_at) from reqversion where reqversion.requirement_id = requirement.id)"
          ))
        .whereRaw(`to_tsvector('english', description || ' ' || coalesce(rationale, '')) @@ to_tsquery('english', '${query}')`);

      const fuse = new Fuse([...files, ...userClasses, ...stakeholderGroups, ...reqversions, ...reqgroups], {
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
