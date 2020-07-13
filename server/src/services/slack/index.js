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
                                "text": "Create a feature: `/reqwise new feature`"
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "Create a quality attribute: `/reqwise new qa`"
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "Create a business requirement group: `/reqwise new br`"
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "Create a requirement: `/reqwise new req`"
                            }
                        },
                    ]
                });
            }
            else if (request.body.text.startsWith("new feature")) {
                const { slackAccessToken } = await fastify.knex.from("team").select("*").where({ "slackTeamId": request.body.team_id }).first();
                const projects = await fastify.knex.from("team")
                    .select("*", "project.name as name", "project.id as id")
                    .where({ "slackTeamId": request.body.team_id })
                    .join("project", "project.team_id", "team.id");
                const modal = {
                    ...request.body,
                    token: slackAccessToken,
                    view: JSON.stringify({
                        type: 'modal',
                        title: {
                            type: 'plain_text',
                            text: 'Submit a new feature'
                        },
                        callback_id: 'new_feature',
                        submit: {
                            type: 'plain_text',
                            text: 'Submit'
                        },
                        blocks: [
                            {
                                block_id: 'name_block',
                                type: 'input',
                                label: {
                                    type: 'plain_text',
                                    text: 'Feature name'
                                },
                                element: {
                                    action_id: 'name',
                                    type: 'plain_text_input',
                                },
                            },
                            {
                                block_id: 'project_block',
                                type: 'input',
                                label: {
                                    type: 'plain_text',
                                    text: 'Project'
                                },
                                element: {
                                    action_id: 'project',
                                    type: 'static_select',
                                    options: projects.map(p => ({
                                        text: {
                                            type: "plain_text",
                                            text: p.name
                                        },
                                        value: String(p.id)
                                    }))
                                },
                                optional: false
                            },
                            {
                                block_id: 'prioritizable_block',
                                "type": "input",
                                "element": {
                                    action_id: "is_prioritizable",
                                    "type": "checkboxes",
                                    "options": [
                                        {
                                            "text": {
                                                "type": "plain_text",
                                                "text": "Requirements are prioritizable"
                                            },
                                            "value": "prioritizable"
                                        }
                                    ]
                                },
                                "label": {
                                    "type": "plain_text",
                                    "text": "Options"
                                },
                                optional: true
                            }
                        ]
                    })
                };

                await fastify.slack.views.open(modal);
                return "";
            }

            else if (request.body.text.startsWith("new req")) {
                const { slackAccessToken } = await fastify.knex.from("team").select("*").where({ "slackTeamId": request.body.team_id }).first();
                const reqgroups = await fastify.knex.from("team")
                    .select("*", "project.name as projectName", "reqgroup.name as name", "per_project_unique_id.readable_id as ppuid", "reqgroup.id as id")
                    .where({ "slackTeamId": request.body.team_id })
                    .join("project", "project.team_id", "team.id")
                    .join("reqgroup", 'reqgroup.project_id', "project.id")
                    .join("per_project_unique_id", "per_project_unique_id.id", "reqgroup.ppuid_id");
                const modal = {
                    ...request.body,
                    token: slackAccessToken,
                    view: JSON.stringify({
                        type: 'modal',
                        title: {
                            type: 'plain_text',
                            text: 'Submit a new requirement'
                        },
                        callback_id: 'new_requirement',
                        submit: {
                            type: 'plain_text',
                            text: 'Submit'
                        },
                        blocks: [
                            {
                                block_id: 'description_block',
                                type: 'input',
                                label: {
                                    type: 'plain_text',
                                    text: 'Requirement description'
                                },
                                element: {
                                    action_id: 'description',
                                    type: 'plain_text_input',
                                },
                            },
                            {
                                block_id: 'priority_block',
                                type: 'input',
                                label: {
                                    type: 'plain_text',
                                    text: 'Priority'
                                },
                                element: {
                                    action_id: 'priority',
                                    type: 'static_select',
                                    options: [
                                        {
                                            text: {
                                                type: "plain_text",
                                                text: "High"
                                            },
                                            value: "high"
                                        },
                                        {
                                            text: {
                                                type: "plain_text",
                                                text: "Medium"
                                            },
                                            value: "medium"
                                        },
                                        {
                                            text: {
                                                type: "plain_text",
                                                text: "Low"
                                            },
                                            value: "low"
                                        }
                                    ]
                                },
                                optional: false
                            },
                            {
                                block_id: 'status_block',
                                type: 'input',
                                label: {
                                    type: 'plain_text',
                                    text: 'Status'
                                },
                                element: {
                                    action_id: 'status',
                                    type: 'static_select',
                                    options: [
                                        {
                                            text: {
                                                type: "plain_text",
                                                text: "Proposed"
                                            },
                                            value: "proposed"
                                        },
                                        {
                                            text: {
                                                type: "plain_text",
                                                text: "Accepted"
                                            },
                                            value: "accepted"
                                        },
                                        {
                                            text: {
                                                type: "plain_text",
                                                text: "Implemented"
                                            },
                                            value: "implemented"
                                        }
                                    ]
                                },
                                optional: false
                            },
                            {
                                block_id: 'reqgroup_block',
                                type: 'input',
                                label: {
                                    type: 'plain_text',
                                    text: 'Requirement group'
                                },
                                element: {
                                    action_id: 'reqgroup',
                                    type: 'static_select',
                                    options: reqgroups.map(g => ({
                                        text: {
                                            type: "plain_text",
                                            text: `#${g.ppuid} - ${g.name} (${g.projectName})`
                                        },
                                        value: String(g.id)
                                    }))
                                },
                                optional: false
                            }
                        ]
                    })
                };

                await fastify.slack.views.open(modal);
                return "";
            }

            return "Command not recognized";
        }
    );

    const getReqgroupType = type => {
        if (type === "quality") {
            return "quality attribute";
        } else if (type === "business") {
            return "business requirement group";
        } else {
            return type;
        }
    }

    const postInteractionSchema = {
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
        "/interaction",
        { schema: postInteractionSchema },
        async (request, reply) => {
            const data = JSON.parse(request.body.payload);
            if (data.view.callback_id === "new_feature") {
                const name = data.view.state.values.name_block.name.value;
                const project_id = Number(data.view.state.values.project_block.project.selected_option.value);
                const type = "feature";
                const isPrioritized = !!data.view.state.values.prioritizable_block.is_prioritizable.selected_options;

                const { slackAccessToken: token } = await fastify.knex
                    .from("project")
                    .select("team.*", "project.*")
                    .join("team", "team.id", "project.team_id")
                    .where("project.id", project_id)
                    .first();

                const { id: account_id, name: account_name, imageName: account_imageName } = await fastify.knex
                    .from("slackUser")
                    .select("account.*")
                    .join("account", "account.slackUser_id", "slackUser.id")
                    .where("slackUser.slackId", data.user.id).first();

                const maxPpuid =
                    (
                        await fastify
                            .knex("per_project_unique_id")
                            .where({ project_id })
                            .max("readable_id")
                            .first()
                    ).max || 0;

                await fastify.knex("project").where({ id: project_id }).update({ reqgroups_updated_at: new Date(Date.now()) });

                const ppuid_id = (await fastify
                    .knex("per_project_unique_id")
                    .insert({
                        project_id,
                        readable_id: maxPpuid + 1
                    })
                    .returning("id"))[0];

                const [id] = await fastify
                    .knex("reqgroup")
                    .insert({
                        project_id,
                        name,
                        type,
                        ppuid_id,
                        created_by: account_id,
                        updated_by: account_id,
                        isPrioritized
                    })
                    .returning("id");

                if (token) {
                    const channel = await fastify.slackGetChannelId(project_id);
                    await fastify.slack.chat.postMessage({
                        text: `${account_name || data.user.name} made a new ${getReqgroupType(type)}: <https://reqwise.com/project/${fastify.obfuscateId(project_id)}|#${maxPpuid + 1} - ${name}>.`,
                        token,
                        channel,
                        username: account_name || data.user.name,
                        icon_url: account_imageName && `https://storage.googleapis.com/user-file-storage/${account_imageName}`
                    });
                }

                await fastify.createAlert("create", "reqgroup", name, id, project_id, account_id);

            }
            else if (data.view.callback_id === "new_requirement") {
                console.log(data.view.state.values.description_block.description);
                return "TODO";
            }
            return "";
        });
};
