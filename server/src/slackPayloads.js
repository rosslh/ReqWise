module.exports = {
    help: () => {
        return {
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
        };
    },
    newFeatureModal: context => {
        return {
            ...context.body,
            token: context.slackAccessToken,
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
                            options: context.projects.map(p => ({
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
    },
    newRequirementModal: context => {
        return {
            ...context.body,
            token: context.slackAccessToken,
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
                            options: context.reqgroups.map(g => ({
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
    },
    newRequirementMessage: ({ request, status, description, priority, project_id, requirement_id, ppuid_id, fastify, reqgroup_id, reqgroup_ppuid, reqgroup_name, rationale, token, channel }) => {
        return {
            text: `${request.user.name} ${status === "proposed" ? "proposed" : "made"} a new requirement.`,
            blocks: [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `You have a new requirement: *<https://reqwise.com/project/${fastify.obfuscateId(project_id)}/requirement/${fastify.obfuscateId(requirement_id)}|#${ppuid_id} - ${description}>*. Give feedback by replying to this message.`
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": `*Description:*\n${description}`
                        },
                        {
                            "type": "mrkdwn",
                            "text": `*Priority:*\n${priority}`
                        },
                        {
                            "type": "mrkdwn",
                            "text": `*Status:*\n${status}`
                        },
                        ...(reqgroup_id ? [{
                            "type": "mrkdwn",
                            "text": `*Part of requirement group:*\n<https://reqwise.com/project/${fastify.obfuscateId(project_id)}/reqgroup/${fastify.obfuscateId(reqgroup_id)}|#${reqgroup_ppuid} - ${reqgroup_name}>`
                        }] : [])
                    ]
                },
                {
                    "type": "divider"
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": `*Author:*\n${request.user.name}`
                        },
                        {
                            "type": "mrkdwn",
                            "text": `*Rationale:*\n${rationale || "_No rationale_"}`
                        }
                    ]
                }
            ],
            token,
            channel,
            username: request.user.name,
            icon_url: request.user.imageName && `https://storage.googleapis.com/user-file-storage/${request.user.imageName}`
        };
    }
}