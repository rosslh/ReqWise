"use strict";
const fp = require("fastify-plugin");

module.exports = fp(async (fastify, opts) => {
  fastify.addHook("preParsing", async (request, reply, payload) => {
    // Notice: the next callback is not available when using async/await
    // or returning a Promise. If you do invoke a next callback in this
    // situation unexpected behavior may occur, e.g. duplicate invocation
    // of handlers.
    Object.keys(request.params).forEach((key) => {
      if (key.endsWith("Id")) {
        request.params[key] = fastify.deobfuscateId(request.params[key]);
      }
    });
  });

  // fastify.addHook('preParsing', (request, reply, next) => {
  //   next()
  // })
});
