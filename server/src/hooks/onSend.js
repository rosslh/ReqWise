"use strict";

const fp = require("fastify-plugin");

module.exports = fp(async (fastify, opts) => {
  fastify.addHook("onSend", (request, reply, payload, done) => {
    // Notice: the next callback is not available when using async/await
    // or returning a Promise. If you do invoke a next callback in this
    // situation unexpected behavior may occur, e.g. duplicate invocation
    // of handlers.

    // TODO: evaluate performance impact of moving this to preSerialization
    const newPayload = fastify.obfuscateIdsInJson(payload)
    done(null, newPayload);
  });
});
