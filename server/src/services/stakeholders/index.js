module.exports = async function (fastify, opts) {
    const getStakeholderGroupUsers = {
        body: {},
        queryString: {},
        params: {
            type: "object",
            properties: {
                teamId: { type: "number" },
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
            preValidation: [fastify.authenticate],
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
};
