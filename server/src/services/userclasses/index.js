module.exports = async function (fastify, opts) {
    const getUserclassChampions = {
        body: {},
        queryString: {},
        params: {
            type: "object",
            properties: {
                userclassId: { type: "number" },
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
        "/userclasses/:userclassId/champions",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: getUserclassChampions,
        },
        async function (request, reply) {
            return await fastify.knex
                .from("account_userclass")
                .select("*", "account.*")
                .join("account", "account.id", "account_userclass.account_id")
                .where("userclass_id", request.params.userclassId);
        }
    );

    const postChampionSchema = {
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
                userclassId: { type: "number" },
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
        "/userclasses/:userclassId/champions",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: postChampionSchema,
        },
        async function (request, reply) {
            const { account_id, description } = request.body;
            const { userclassId } = request.params;

            return await fastify
                .knex("account_userclass")
                .insert({
                    account_id: fastify.deobfuscateId(account_id),
                    userclass_id: userclassId,
                    description
                })
                .returning("id");
        }
    );

    const deleteUserclassSchema = {
        body: {},
        queryString: {},
        params: {
            type: "object",
            properties: {
                userclassId: { type: "number" },
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
        "/userclasses/:userclassId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: deleteUserclassSchema,
        },
        async function (request, reply) {
            await fastify
                .knex("userclass")
                .where("id", request.params.userclassId)
                .del();
            return ["success"];
        }
    );

    const putUserclassSchema = {
        body: {
            type: "object",
            properties: {
                name: { type: "string" },
                description: { type: "string" },
                persona: { type: "string" },
                importance: { type: "string" },
            },
            required: ["name"],
        },
        queryString: {},
        params: {
            type: "object",
            properties: {
                userclassId: { type: "number" },
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
        "/userclasses/:userclassId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: putUserclassSchema,
        },
        async function (request, reply) {
            const { name, description, persona, importance } = request.body;
            return await fastify
                .knex("userclass")
                .where("id", request.params.userclassId)
                .update({
                    name,
                    description,
                    persona,
                    importance,
                    updated_at: new Date(Date.now()),
                    updated_by: request.user.id,
                })
                .returning("id");
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

    const deleteChampionSchema = {
        body: {},
        queryString: {},
        params: {
            type: "object",
            properties: {
                userclassId: { type: "number" },
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
        "/userclasses/:userclassId/champions/:accountId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: deleteChampionSchema,
        },
        async function (request, reply) {
            await fastify
                .knex("account_userclass")
                .where({
                    "userclass_id": request.params.userclassId,
                    "account_id": request.params.accountId,
                }).del();
            return ["success"];
        }
    );
};
