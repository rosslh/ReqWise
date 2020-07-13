"use strict";
const slackdown = require("../../slackdown");
const htmlToText = require("html-to-text");

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
                        .select("id")
                        .where({
                            slackMessageTs: event.thread_ts,
                        })
                        .first();

                    const { account_id, slackUser_id } = await fastify.knex
                        .from("slackUser")
                        .select(
                            "slackUser.*",
                            "account.*",
                            "account.id as account_id",
                            "slackUser.id as slackUser_id"
                        )
                        .leftJoin("account", "slackUser.id", "account.slackUser_id")
                        .where({
                            slackId: event.user,
                        })
                        .first();

                    const html = slackdown.parse(event.text);

                    await fastify.knex("comment").insert({
                        reqversion_id,
                        slackUser_id,
                        account_id,
                        plaintext: htmlToText.fromString(html),
                        html,
                        mrkdwn: event.text,
                        type: "comment",
                    });
                } catch (e) {
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
                text: { type: "string" },
            },
            required: ["user_id", "user_name", "command", "text"],
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
                return fastify.slackPayloads.help();
            } else if (request.body.text.startsWith("new feature")) {
                const { slackAccessToken } = await fastify.knex
                    .from("team")
                    .select("*")
                    .where({ slackTeamId: request.body.team_id })
                    .first();
                const projects = await fastify.knex
                    .from("team")
                    .select("*", "project.name as name", "project.id as id")
                    .where({ slackTeamId: request.body.team_id })
                    .join("project", "project.team_id", "team.id");
                const modal = fastify.slackPayloads.newFeatureModal({
                    projects,
                    slackAccessToken,
                    body: request.body,
                });
                await fastify.slack.views.open(modal);
                return "";
            } else if (request.body.text.startsWith("new req")) {
                const { slackAccessToken } = await fastify.knex
                    .from("team")
                    .select("*")
                    .where({ slackTeamId: request.body.team_id })
                    .first();
                const reqgroups = await fastify.knex
                    .from("team")
                    .select(
                        "*",
                        "project.name as projectName",
                        "reqgroup.name as name",
                        "per_project_unique_id.readable_id as ppuid",
                        "reqgroup.id as id"
                    )
                    .where({ slackTeamId: request.body.team_id })
                    .join("project", "project.team_id", "team.id")
                    .join("reqgroup", "reqgroup.project_id", "project.id")
                    .join(
                        "per_project_unique_id",
                        "per_project_unique_id.id",
                        "reqgroup.ppuid_id"
                    );

                const modal = fastify.slackPayloads.newRequirementModal({
                    slackAccessToken,
                    reqgroups,
                    body: request.body,
                });

                await fastify.slack.views.open(modal);
                return "";
            }

            return "Command not recognized";
        }
    );

    const getReqgroupType = (type) => {
        if (type === "quality") {
            return "quality attribute";
        } else if (type === "business") {
            return "business requirement group";
        } else {
            return type;
        }
    };

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
                const project_id = Number(
                    data.view.state.values.project_block.project.selected_option.value
                );
                const type = "feature";
                const isPrioritized = !!data.view.state.values.prioritizable_block
                    .is_prioritizable.selected_options;

                const { slackAccessToken: token } = await fastify.knex
                    .from("project")
                    .select("team.*", "project.*")
                    .join("team", "team.id", "project.team_id")
                    .where("project.id", project_id)
                    .first();

                const {
                    id: account_id,
                    name: author_name,
                    imageName: author_imageName,
                } = await fastify.knex
                    .from("slackUser")
                    .select("account.*")
                    .join("account", "account.slackUser_id", "slackUser.id")
                    .where("slackUser.slackId", data.user.id)
                    .first();

                const maxPpuid =
                    (
                        await fastify
                            .knex("per_project_unique_id")
                            .where({ project_id })
                            .max("readable_id")
                            .first()
                    ).max || 0;

                await fastify
                    .knex("project")
                    .where({ id: project_id })
                    .update({ reqgroups_updated_at: new Date(Date.now()) });

                const ppuid_id = (
                    await fastify
                        .knex("per_project_unique_id")
                        .insert({
                            project_id,
                            readable_id: maxPpuid + 1,
                        })
                        .returning("id")
                )[0];

                const [id] = await fastify
                    .knex("reqgroup")
                    .insert({
                        project_id,
                        name,
                        type,
                        ppuid_id,
                        created_by: account_id,
                        updated_by: account_id,
                        isPrioritized,
                    })
                    .returning("id");

                if (token) {
                    const channel = await fastify.slackGetChannelId(project_id);
                    await fastify.slack.chat.postMessage({
                        text: `${
                            author_name || data.user.name
                            } made a new ${getReqgroupType(
                                type
                            )}: <https://reqwise.com/project/${fastify.obfuscateId(
                                project_id
                            )}|#${maxPpuid + 1} - ${name}>.`,
                        token,
                        channel,
                        username: author_name || data.user.name,
                        icon_url:
                            author_imageName &&
                            `https://storage.googleapis.com/user-file-storage/${author_imageName}`,
                    });
                }

                await fastify.createAlert(
                    "create",
                    "reqgroup",
                    name,
                    id,
                    project_id,
                    account_id
                );
            } else if (data.view.callback_id === "new_requirement") {
                const description =
                    data.view.state.values.description_block.description.value;
                const priority =
                    data.view.state.values.priority_block.priority.selected_option.value;
                const status =
                    data.view.state.values.status_block.status.selected_option.value;
                const rationale = "";
                const reqgroup_id = Number(
                    data.view.state.values.reqgroup_block.reqgroup.selected_option.value
                );

                const {
                    id: account_id,
                    name: author_name,
                    imageName: author_imageName,
                } = await fastify.knex
                    .from("slackUser")
                    .select("account.*")
                    .join("account", "account.slackUser_id", "slackUser.id")
                    .where("slackUser.slackId", data.user.id)
                    .first();

                const {
                    project_id,
                    isMaxOneRequirement,
                    slackAccessToken: token,
                    name: reqgroup_name,
                    ppuid: reqgroup_ppuid,
                } = await fastify.knex
                    .from("reqgroup")
                    .select(
                        "reqgroup.*",
                        "team.slackAccessToken",
                        "per_project_unique_id.readable_id as ppuid"
                    )
                    .join(
                        "per_project_unique_id",
                        "per_project_unique_id.id",
                        "reqgroup.ppuid_id"
                    )
                    .join("project", "project.id", "reqgroup.project_id")
                    .join("team", "team.id", "project.team_id")
                    .where({
                        "reqgroup.id": reqgroup_id,
                    })
                    .first();

                const numRequirements =
                    isMaxOneRequirement &&
                    (
                        await fastify.knex.from("requirement").select("id").where({
                            reqgroup_id,
                        })
                    ).length;

                if (!isMaxOneRequirement || numRequirements === 0) {
                    const maxPpuid =
                        (
                            await fastify
                                .knex("per_project_unique_id")
                                .where({ project_id })
                                .max("readable_id")
                                .first()
                        ).max || 0;

                    const ppuid_id = (
                        await fastify
                            .knex("per_project_unique_id")
                            .insert({
                                project_id,
                                readable_id: maxPpuid + 1,
                            })
                            .returning("id")
                    )[0];

                    const requirement_id = (
                        await fastify
                            .knex("requirement")
                            .insert({
                                reqgroup_id,
                                project_id,
                                ppuid_id,
                            })
                            .returning("id")
                    )[0];

                    let slackMessageTs;
                    if (token) {
                        const channel = await fastify.slackGetChannelId(project_id);
                        slackMessageTs = (
                            await fastify.slack.chat.postMessage(
                                fastify.slackPayloads.newRequirementMessage({
                                    request,
                                    author_imageName,
                                    author_name,
                                    status,
                                    description,
                                    priority,
                                    project_id,
                                    requirement_id,
                                    ppuid_id,
                                    fastify,
                                    reqgroup_id,
                                    reqgroup_ppuid,
                                    reqgroup_name,
                                    rationale,
                                    token,
                                    channel,
                                })
                            )
                        ).ts;
                    }

                    await fastify
                        .knex("reqversion")
                        .insert({
                            requirement_id,
                            account_id: account_id,
                            updated_by: account_id,
                            description,
                            rationale,
                            priority,
                            status,
                            slackMessageTs,
                        })
                        .returning("id");

                    await fastify
                        .knex("reqgroup")
                        .where("id", reqgroup_id)
                        .update({
                            updated_at: new Date(Date.now()),
                            updated_by: account_id,
                        });

                    await fastify.createAlert(
                        "create",
                        "requirement",
                        description,
                        requirement_id,
                        project_id,
                        account_id
                    );
                }
                return "";
            }
        }
    );
};
