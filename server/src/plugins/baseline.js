const fp = require("fastify-plugin");

module.exports = fp(function (fastify, opts, done) {

  fastify.decorate("createBaseline", async function (reviewId) {
    // get entity associated with review
    // clone entity, setting is_baseline=true and stakeholderReview_id
  });

  done();
});
