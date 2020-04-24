"use strict";

const fp = require("fastify-plugin");
const Hashids = require("hashids/cjs");

module.exports = fp(async (fastify, opts) => {
  const hashids = new Hashids(process.env["HASHID_KEY"], 5);

  fastify.addHook("onSend", (request, reply, payload, done) => {
    // Notice: the next callback is not available when using async/await
    // or returning a Promise. If you do invoke a next callback in this
    // situation unexpected behavior may occur, e.g. duplicate invocation
    // of handlers.

    // TODO: evaluate performance impact of moving this to preSerialization
    const newPayload = payload // this does not handle escaped quotes
      ? payload.replace(/"([^"]*_|)id":(\d+)/g, (_, $1, $2) => {
          return `"${$1}id":"${fastify.obfuscateId($2)}"`;
        })
      : payload;
    done(null, newPayload);
  });
});
