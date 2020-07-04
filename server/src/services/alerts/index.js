module.exports = async function (fastify, opts) {
    const getUserclassSchema = {
        body: {},
        queryString: {},
        params: {
            type: "object",
            properties: {},
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
        "/alerts",
        {
            preValidation: [fastify.authenticate],
            schema: getUserclassSchema,
        },
        async function (request, reply) {
            return await fastify.knex
                .from("account_alert")
                .select("alert.*", "account_alert.*", "account.*", "alert.id as id")
                .join("alert", "account_alert.alert_id", "alert.id")
                .join("account", "alert.created_by", "account.id")
                .where("account_alert.account_id", request.params.userclassId)
                .first();
        }
    );


    const putChampionSchema = {
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
                userclassId: { type: "number" },
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
        "/userclasses/:userclassId/champions/:accountId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: putChampionSchema,
        },
        async function (request, reply) {
            const { description } = request.body;
            return await fastify
                .knex("account_userclass")
                .where({
                    "userclass_id": request.params.userclassId,
                    "account_id": request.params.accountId,
                })
                .update({
                    description
                })
                .returning("id");
        }
    );
};
