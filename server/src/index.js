const { dev, qa, production } = require("../knexfile");
const fastifyPlugin = require("fastify-plugin");
const knex = require("knex");
const path = require("path");
const AutoLoad = require("fastify-autoload");
const CORS = require("fastify-cors");
const helmet = require('fastify-helmet')

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
  fastify.register(require('fastify-formbody'));

  fastify.register(
    helmet,
    {}
  );

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
    methods: ["GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"],
    origin: true,
  });

  if (process.env.KNEXMODE === "production") {
    fastify.register(fastifyPlugin(fastifyKnexJS, ">=0.30.0"), production);
  } else if (process.env.KNEXMODE === "qa") {
    fastify.register(fastifyPlugin(fastifyKnexJS, ">=0.30.0"), qa);
  } else {
    fastify.register(fastifyPlugin(fastifyKnexJS, ">=0.30.0"), dev);
  }

  next();
};

module.exports.options = {
  trustProxy: true
}
