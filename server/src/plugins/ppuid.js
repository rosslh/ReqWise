"use-strict";

const fp = require("fastify-plugin");
const retry = require('async-retry');

module.exports = fp(function (fastify, opts, done) {

  fastify.decorate("getNewPpuid", async function (project_id) {
    return await retry(async (_, attempt) => {
      if (attempt > 1) {
        console.log(`Retrying create PPUID - ${attempt}`);
      }
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
    }, {
      retries: 10
    }
    );
  });

  done();
});
