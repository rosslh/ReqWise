"use-strict";

const fp = require("fastify-plugin");
const Hashids = require("hashids/cjs");

module.exports = fp(function (fastify, opts, done) {
  const hashids = new Hashids(process.env["HASHID_KEY"], 5);

  fastify.decorate("deobfuscateId", function (str) {
    return hashids.decode(str)[0] || str;
  });

  fastify.decorate("obfuscateId", function (num) {
    return hashids.encode(num);
  });

  fastify.decorate("obfuscateIdsInJson", function (payload) {
    return payload && typeof payload === "string" // this does not handle escaped quotes
      ? payload.replace(/"([^"]*_|)id":(\d+)/g, (_, $1, $2) => {
        return `"${$1}id":"${fastify.obfuscateId($2)}"`;
      })
      : payload;
  });

  done();
});
