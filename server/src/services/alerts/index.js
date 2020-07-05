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
                .select("alert.*", "account_alert.*", "team.name as teamName", "project.name as projectName", "project.team_id as team_id", "account.name as authorName", "account.imageName as authorImageName", "alert.id as id")
                .join("alert", "account_alert.alert_id", "alert.id")
                .join("account", "alert.created_by", "account.id")
                .join("project", "project.id", "alert.project_id")
                .join("team", "team.id", "project.team_id")
                .where("account_alert.account_id", request.user.id)
                .orderBy("created_at", "desc");
        }
    );
};
