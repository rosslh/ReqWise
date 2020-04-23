"use strict";

const fp = require("fastify-plugin");
const Hashids = require("hashids/cjs");

module.exports = fp(async (fastify, opts) => {
  const hashids = new Hashids(process.env["HASHID_KEY"], 5);

  fastify.addHook("preParsing", async (request, reply) => {
    // Notice: the next callback is not available when using async/await
    // or returning a Promise. If you do invoke a next callback in this
    // situation unexpected behavior may occur, e.g. duplicate invocation
    // of handlers.
    Object.keys(request.params).forEach((key) => {
      if (key.endsWith("Id") && isNaN(request.params[key])) {
        request.params[key] = Number(hashids.decode(request.params[key]));
      }
    });
  });

  // fastify.addHook('preParsing', (request, reply, next) => {
  //   next()
  // })
});
