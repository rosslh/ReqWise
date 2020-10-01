"use-strict";

const fp = require("fastify-plugin");

module.exports = fp(function (fastify, opts, done) {
  const io = require('socket.io')(fastify.server);

  fastify.decorate("io", io);

  done();
});
