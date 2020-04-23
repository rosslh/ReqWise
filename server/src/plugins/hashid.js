const fp = require("fastify-plugin");
const Hashids = require("hashids/cjs");

module.exports = fp(function (fastify, opts, done) {
  const hashids = new Hashids(process.env["HASHID_KEY"], 5);

  fastify.decorate("decodeHashId", function (str) {
    return Number(hashids.decode(str));
  });

  fastify.decorate("encodeHashId", function (num) {
    return hashids.encode(num);
  });

  done();
});
