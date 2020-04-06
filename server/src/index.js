const { development } = require("../knexfile");
const fastifyPlugin = require("fastify-plugin");
const knex = require("knex");
const path = require("path");
const AutoLoad = require("fastify-autoload");
const CORS = require("fastify-cors");

require("dotenv").config();

function fastifyKnexJS(fastify, opts, next) {
  try {
    const handler = knex(opts);
    fastify.decorate("knex", handler);
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = function (fastify, opts, next) {
  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });

  // This loads all plugins defined in services
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "services"),
    options: Object.assign({}, opts),
  });

  // This loads all hooks defined in hooks
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "hooks"),
    options: Object.assign({}, opts),
  });

  fastify.register(CORS, {
    methods: ["GET", "PUT", "POST", "DELETE"],
    origin: true,
  });

  fastify.register(fastifyPlugin(fastifyKnexJS, ">=0.30.0"), development);

  next();
};
