const fp = require("fastify-plugin");
const { WebClient } = require('@slack/web-api');
const payloads = require("../slackPayloads");

module.exports = fp(function (fastify, opts, done) {
  const web = new WebClient();

  fastify.decorate("slack", web);

  fastify.decorate("slackGetChannelId", async (projectId) => {
    const { slackAccessToken: token, slackChannelName } = await fastify.knex
      .from("project")
      .select("team.*", "project.*")
      .join("team", "team.id", "project.team_id")
      .where("project.id", projectId)
      .first();

    try {
      await fastify.slack.conversations.create({ token, name: slackChannelName });
    } catch (e) {
      // console.log(e);
    }

    const channel = (await fastify.slack.conversations.list({ token })).channels.find(x => x.name.toLowerCase() === slackChannelName.toLowerCase()).id; // TODO: take channel name for each project

    try {
      await fastify.slack.conversations.join({ channel, token });
    } catch (e) {
      // console.log(e);
    }
    return channel;
  });

  fastify.decorate("slackPayloads", payloads);

  done();
});
