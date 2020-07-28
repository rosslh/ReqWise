const fp = require("fastify-plugin");

module.exports = fp(function (fastify, opts, done) {

  fastify.decorate("getNewPpuid", async function (project_id) {
    const maxPpuid =
      (
        await fastify
          .knex("per_project_unique_id")
          .where({ project_id })
          .max("readable_id")
          .first()
      ).max || 0;
    return (await fastify
      .knex("per_project_unique_id")
      .insert({
        project_id,
        readable_id: maxPpuid + 1
      })
      .returning("*"))[0];
  });

  done();
});
