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
                .select("alert.*", "account_alert.*", "account.name", "alert.id as id")
                .join("alert", "account_alert.alert_id", "alert.id")
                .join("account", "alert.created_by", "account.id")
                .where("account_alert.account_id", request.user.id);
        }
    );
};
