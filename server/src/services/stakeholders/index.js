module.exports = async function (fastify, opts) {
    const getStakeholderGroupUsers = {
        body: {},
        queryString: {},
        params: {
            type: "object",
            properties: {
                stakeholderGroupId: { type: "number" },
            },
        },
        headers: {
            type: "object",
            properties: {
                Authorization: { type: "string" },
            },
            required: ["Authorization"],
        },
        response: {},
    };
    fastify.get(
        "/stakeholders/:stakeholderGroupId/users",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: getStakeholderGroupUsers,
        },
        async function (request, reply) {
            return await fastify.knex
                .from("account_stakeholderGroup")
                .select("*", "account.*")
                .join("account", "account.id", "account_stakeholderGroup.account_id")
                .where("stakeholderGroup_id", request.params.stakeholderGroupId);
        }
    );

    const postStakeholderSchema = {
        body: {
            type: "object",
            properties: {
                account_id: { type: ["number", "string"] }
            }
        },
        queryString: {},
        params: {
            type: "object",
            properties: {
                stakeholderGroupId: { type: "number" },
            },
        },
        headers: {
            type: "object",
            properties: {
                Authorization: { type: "string" },
                "Content-Type": { type: "string" },
            },
            required: ["Authorization", "Content-Type"],
        },
        response: {
            200: {
                type: "object",
                properties: {
                    team_id: { type: "number" },
                },
            },
        },
    };
    fastify.post(
        "/stakeholders/:stakeholderGroupId/users",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: postStakeholderSchema,
        },
        async function (request, reply) {
            const { account_id, description } = request.body;
            const { stakeholderGroupId } = request.params;

            return await fastify
                .knex("account_stakeholderGroup")
                .insert({
                    account_id: fastify.deobfuscateId(account_id),
                    stakeholderGroup_id: stakeholderGroupId,
                    description
                })
                .returning("id");
        }
    );

    const deleteStakeholderGroupSchema = {
        body: {},
        queryString: {},
        params: {
            type: "object",
            properties: {
                stakeholderGroupId: { type: "number" },
            },
        },
        headers: {
            type: "object",
            properties: {
                Authorization: { type: "string" },
            },
            required: ["Authorization"],
        },
        response: {
            200: {
                type: "array",
                maxItems: 1,
                items: { type: "string" },
            },
        },
    };
    fastify.delete(
        "/stakeholders/:stakeholderGroupId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: deleteStakeholderGroupSchema,
        },
        async function (request, reply) {
            await fastify
                .knex("stakeholderGroup")
                .where("id", request.params.stakeholderGroupId)
                .del();
            return ["success"];
        }
    );

    const putStakeholderGroupSchema = {
        body: {
            type: "object",
            properties: {
                name: { type: "string" },
                description: { type: "string" },
            },
            required: ["name"],
        },
        queryString: {},
        params: {
            type: "object",
            properties: {
                stakeholderGroupId: { type: "number" },
            },
        },
        headers: {
            type: "object",
            properties: {
                Authorization: { type: "string" },
            },
            required: ["Authorization"],
        },
        response: {
            200: {
                type: "array",
                maxItems: 1,
                items: { type: "number" },
            },
        },
    };
    fastify.put(
        "/stakeholders/:stakeholderGroupId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: putStakeholderGroupSchema,
        },
        async function (request, reply) {
            const { name, description } = request.body;
            return await fastify
                .knex("stakeholderGroup")
                .where("id", request.params.stakeholderGroupId)
                .update({
                    name,
                    description,
                    updated_at: new Date(Date.now()),
                    updated_by: request.user.id,
                })
                .returning("id");
        }
    );

    const putStakeholderSchema = {
        body: {
            type: "object",
            properties: {
                description: { type: "string" },
            },
            required: ["description"],
        },
        queryString: {},
        params: {
            type: "object",
            properties: {
                stakeholderGroupId: { type: "number" },
                accountId: { type: "number" },
            },
        },
        headers: {
            type: "object",
            properties: {
                Authorization: { type: "string" },
            },
            required: ["Authorization"],
        },
        response: {
            200: {
                type: "array",
                maxItems: 1,
                items: { type: "number" },
            },
        },
    };
    fastify.put(
        "/stakeholders/:stakeholderGroupId/users/:accountId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: putStakeholderSchema,
        },
        async function (request, reply) {
            const { description } = request.body;
            return await fastify
                .knex("account_stakeholderGroup")
                .where({
                    "stakeholderGroup_id": request.params.stakeholderGroupId,
                    "account_id": request.params.accountId,
                })
                .update({
                    description
                })
                .returning("id");
        }
    );

    const deleteStakeholderSchema = {
        body: {},
        queryString: {},
        params: {
            type: "object",
            properties: {
                stakeholderGroupId: { type: "number" },
            },
        },
        headers: {
            type: "object",
            properties: {
                Authorization: { type: "string" },
            },
            required: ["Authorization"],
        },
        response: {
            200: {
                type: "array",
                maxItems: 1,
                items: { type: "string" },
            },
        },
    };
    fastify.delete(
        "/stakeholders/:stakeholderGroupId/users/:accountId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: deleteStakeholderSchema,
        },
        async function (request, reply) {
            await fastify
                .knex("account_stakeholderGroup")
                .where({
                    "stakeholderGroup_id": request.params.stakeholderGroupId,
                    "account_id": request.params.accountId,
                }).del();
            return ["success"];
        }
    );
};
