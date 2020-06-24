const fp = require("fastify-plugin");
const { WebClient } = require('@slack/web-api');

module.exports = fp(function (fastify, opts, done) {
    const web = new WebClient();

    fastify.decorate("slack", web);

    done();
});
