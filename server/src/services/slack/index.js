"use strict"
const slackdown = require('../../slackdown');
const htmlToText = require('html-to-text');

module.exports = async (fastify, opts) => {
    const postEventSchema = {
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
        "/events",
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


    const postSlashCommandSchema = {
        body: {
            type: "object",
            properties: {
                user_id: { type: "string" },
                user_name: { type: "string" },
                command: { type: "string" },
                text: { type: "string" }
            },
            required: ["user_id", "user_name", "command", "text"]
        },
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
        "/slash-command",
        { schema: postSlashCommandSchema },
        async (request, reply) => {
            if (request.body.text === "help") {
                return ({
                    "blocks": [
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "Create a feature: `/reqwise create feature`"
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "Create a quality attribute: `/reqwise create qa`"
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "Create a business requirement group: `/reqwise create br`"
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "Create a requirement: `/reqwise create requirement`"
                            }
                        },
                    ]
                });
            }
            else if (request.body.text === "create") {
                return "TODO: implement this"; // TODO
            }
            // console.log(request.body);
            return ["success"];
        }
    );
};
