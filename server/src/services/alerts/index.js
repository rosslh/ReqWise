module.exports = async function (fastify, opts) {
    const getUnreadAlertsSchema = {
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
            schema: getUnreadAlertsSchema,
        },
        async function (request, reply) {
            return await fastify.knex
                .from("account_alert")
                .select("alert.*", "account_alert.*", "team.name as teamName", "project.name as projectName", "project.team_id as team_id", "account.name as authorName", "account.imageName as authorImageName", "alert.id as id")
                .join("alert", "account_alert.alert_id", "alert.id")
                .join("account", "alert.created_by", "account.id")
                .join("project", "project.id", "alert.project_id")
                .join("team", "team.id", "project.team_id")
                .where({ "account_alert.account_id": request.user.id, "account_alert.is_read": false })
                .orderBy("created_at", "desc");
        }
    );

    const getReadAlertsSchema = {
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
        "/alerts/read",
        {
            preValidation: [fastify.authenticate],
            schema: getReadAlertsSchema,
        },
        async function (request, reply) {
            return await fastify.knex
                .from("account_alert")
                .select("alert.*", "account_alert.*", "team.name as teamName", "project.name as projectName", "project.team_id as team_id", "account.name as authorName", "account.imageName as authorImageName", "alert.id as id")
                .join("alert", "account_alert.alert_id", "alert.id")
                .join("account", "alert.created_by", "account.id")
                .join("project", "project.id", "alert.project_id")
                .join("team", "team.id", "project.team_id")
                .where({ "account_alert.account_id": request.user.id, "account_alert.is_read": true })
                .orderBy("created_at", "desc");
        }
    );

    const putAlertBulkSchema = {
        body: {
            type: "object",
            properties: {
                is_read: { type: "boolean" }
            },
            required: ["is_read"],
        },
        queryString: {},
        params: {
            type: "object",
            properties: {
                alertId: { type: "number" },
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
    fastify.put(
        "/alerts",
        {
            preValidation: [fastify.authenticate],
            schema: putAlertBulkSchema,
        },
        async function (request, reply) {
            const { is_read } = request.body;
            await fastify
                .knex("account_alert")
                .where({ "account_id": request.user.id, "is_read": !is_read })
                .update({
                    is_read
                })
                .returning(["id"]);

            return ["success"];
        }
    );

    const putAlertSchema = {
        body: {
            type: "object",
            properties: {
                is_read: { type: "boolean" }
            },
            required: ["is_read"],
        },
        queryString: {},
        params: {
            type: "object",
            properties: {
                alertId: { type: "number" },
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
        "/alerts/:alertId",
        {
            preValidation: [fastify.authenticate],
            schema: putAlertSchema,
        },
        async function (request, reply) {
            const { is_read } = request.body;
            const [{ id }] = await fastify
                .knex("account_alert")
                .where({ "alert_id": request.params.alertId, "account_id": request.user.id })
                .update({
                    is_read
                })
                .returning(["id"]);

            return [id];
        }
    );
};
