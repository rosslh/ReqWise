const fp = require("fastify-plugin");

module.exports = fp(function (fastify, opts, done) {
  fastify.decorate("getRequirements", async function (reqgroupId) {
    const selectColumns = [
      "requirement.id",
      "requirement.ppuid_id",
      "requirement.parent_requirement_id",
      "requirement.reqgroup_id",
      "requirement.project_id",
      "reqversion.id as reqversion_id",
      "reqversion.account_id",
      "reqversion.priority",
      "reqversion.status",
      "reqversion.description",
      "reqversion.created_at",
      "reqversion.updated_at",
      "per_project_unique_id.readable_id as ppuid",
      "account.name as authorName",
      "updater.name as updaterName"
    ];
    const getReqversion = function () {
      this.on("requirement.id", "=", "reqversion.requirement_id").andOn(
        "reqversion.created_at",
        "=",
        fastify.knex.raw(
          "(select max(created_at) from reqversion where reqversion.requirement_id = requirement.id)"
        )
      );
    };
    return await fastify.knex.withRecursive('ancestors', (qb) => {
      qb.select(...selectColumns, fastify.knex.raw("0 as depth"), fastify.knex.raw("LPAD(per_project_unique_id.readable_id::text, 5, '0') as hierarchical_id")).from('requirement')
        .where('requirement.parent_requirement_id', null)
        .where("reqgroup_id", reqgroupId)
        .join("reqversion", getReqversion)
        .join("account", "account.id", "reqversion.account_id")
        .join("account as updater", "updater.id", "reqversion.updated_by")
        .join("per_project_unique_id", "per_project_unique_id.id", "requirement.ppuid_id")
        .union((qb) => {
          qb.select(...selectColumns, fastify.knex.raw("ancestors.depth + 1"), fastify.knex.raw("concat(ancestors.hierarchical_id, '-', LPAD(per_project_unique_id.readable_id::text, 5, '0')) as hierarchical_id")).from('requirement')
            .join("per_project_unique_id", "per_project_unique_id.id", "requirement.ppuid_id")
            .join('ancestors', 'ancestors.id', 'requirement.parent_requirement_id').join("reqversion", getReqversion)
            .join("account", "account.id", "reqversion.account_id")
            .join("account as updater", "updater.id", "reqversion.updated_by")
        })
    }).select('*').from('ancestors').orderBy('hierarchical_id');
  });

  fastify.decorate("getReqgroups", async function (projectId, type) {
    const whereClause = { "reqgroup.project_id": projectId, type, "is_baseline": false };
    if (!type) delete whereClause.type;

    const reqgroups = await fastify.knex
      .from("reqgroup")
      .select("reqgroup.*", "per_project_unique_id.readable_id as ppuid")
      .join("per_project_unique_id", "per_project_unique_id.id", "reqgroup.ppuid_id")
      .where(whereClause)
      .orderByRaw("coalesce(updated_at,created_at) desc");

    return await Promise.all(reqgroups.map(async (g) => {
      const requirements = await fastify.getRequirements(g.id);

      const latestReview = await fastify.getLatestReview("reqgroup", g.id);

      return ({
        ...g,
        requirements,
        latestReview
      });
    }));
  });

  fastify.decorate("getReqgroup", async function (reqgroupId) {

    const reqgroup = await fastify.knex
      .from("reqgroup")
      .select("*", "per_project_unique_id.readable_id as ppuid", "reqgroup.id as id")
      .where({
        "reqgroup.id": reqgroupId
      })
      .join("per_project_unique_id", "per_project_unique_id.id", "reqgroup.ppuid_id")
      .first();

    const requirements = await fastify.getRequirements(reqgroupId);
    let latestReview;
    if (reqgroup.is_baseline) {
      latestReview = await fastify.getReviewForBaseline("reqgroup", reqgroupId);
    }
    else {
      latestReview = await fastify.getLatestReview("reqgroup", reqgroupId);
    }

    return {
      ...reqgroup,
      requirements,
      latestReview
    };

  });

  done();
});
