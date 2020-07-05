"use strict"
const slackdown = require('../../slackdown');
const htmlToText = require('html-to-text');

module.exports = async (fastify, opts) => {
    const postEventSchema = {
        body: {},
        queryString: {},
        params: {},
        headers: {
            type: "object",
            properties: {
                "Content-Type": { type: "string" },
            },
            required: ["Content-Type"],
        },
        response: {},
    };
    fastify.post(
        "/slack/events",
        { schema: postEventSchema },
        async (request, reply) => {
            if (request.body.challenge) {
                return request.body.challenge;
            }
            const { event } = request.body;
            if (event.type === "message" && event.thread_ts) {
                try {
                    const { id: reqversion_id } = await fastify.knex
                        .from("reqversion")
                        .select(
                            "id"
                        )
                        .where({
                            slackMessageTs: event.thread_ts,
                        }).first();

                    const { account_id, slackUser_id } = await fastify.knex
                        .from("slackUser")
                        .select(
                            "slackUser.*",
                            "account.*",
                            "account.id as account_id",
                            "slackUser.id as slackUser_id",
                        )
                        .leftJoin("account", "slackUser.id", "account.slackUser_id")
                        .where({
                            "slackId": event.user,
                        }).first();

                    const html = slackdown.parse(event.text);

                    await fastify.knex("comment").insert({
                        reqversion_id,
                        slackUser_id,
                        account_id,
                        plaintext: htmlToText.fromString(html),
                        html,
                        mrkdwn: event.text,
                        type: "comment"
                    });
                }
                catch (e) {
                    console.error(e);
                }
            }
            return ["success"];
        }
    );
};
