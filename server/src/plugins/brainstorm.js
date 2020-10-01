"use-strict";

const fp = require("fastify-plugin");

module.exports = fp(function (fastify, opts, done) {
  fastify.decorate("getPromptDetails", async function (p, request) {
    let responses = await fastify.knex.from("brainstormResponse")
      .select("brainstormResponse.*", "account.name as respondentName", "account.email as respondentEmail")
      .leftJoin("account", "account.id", "brainstormResponse.account_id")
      .where({
        "brainstormPrompt_id": p.id
      });

    responses = await Promise.all(responses.map(async r => {
      const reactions = await fastify.knex.from("brainstormReaction").select("*").where({
        brainstormResponse_id: r.id
      });

      const yourReaction = request.user && request.user.id
        ? reactions.find(x => x.account_id === request.user.id)
        : reactions.find(x => x.ipAddress === request.ip);

      const upvotes = reactions.filter(x => x.reactionType === "upvote").length;
      const downvotes = reactions.filter(x => x.reactionType === "downvote").length;

      return { ...r, reactions, upvotes, downvotes, yourReaction };
    }));

    const options = await fastify.knex.from("brainstormResponseOption").select("*").where({
      "brainstormPrompt_id": p.id
    });

    const yourResponse = request.user && request.user.id
      ? responses.find(x => x.account_id === request.user.id)
      : responses.find(x => x.ipAddress === request.ip);

    return { ...p, responses, options, yourResponse };
  });

  done();
});
