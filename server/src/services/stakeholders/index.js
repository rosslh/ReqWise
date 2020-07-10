module.exports = async function (fastify, opts) {
    const getStakeholderGroupSchema = {
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
        "/:stakeholderGroupId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: getStakeholderGroupSchema,
        },
        async function (request, reply) {
            return await fastify.knex
                .from("stakeholderGroup")
                .select("stakeholderGroup.*", "per_project_unique_id.readable_id as ppuid")
                .join("per_project_unique_id", "per_project_unique_id.id", "stakeholderGroup.ppuid_id")
                .where({
                    "stakeholderGroup.id": request.params.stakeholderGroupId,
                })
                .first();
        }
    );

    const getStakeholderGroupUsers = {
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
        "/:stakeholderGroupId/users",
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
        response: {},
    };
    fastify.post(
        "/:stakeholderGroupId/users",
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
        "/:stakeholderGroupId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: deleteStakeholderGroupSchema,
        },
        async function (request, reply) {
            const group = await fastify.knex
                .from("stakeholderGroup")
                .select("stakeholderGroup.*")
                .where({
                    "stakeholderGroup.id": request.params.stakeholderGroupId,
                })
                .first();
            await fastify
                .knex("stakeholderGroup")
                .where("id", request.params.stakeholderGroupId)
                .del();
            await fastify.createAlert("delete", "stakeholderGroup", group.name, null, group.project_id, request.user.id);
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
        "/:stakeholderGroupId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: putStakeholderGroupSchema,
        },
        async function (request, reply) {
            const { name, description } = request.body;
            const [{ id, name: groupName, project_id }] = await fastify
                .knex("stakeholderGroup")
                .where("id", request.params.stakeholderGroupId)
                .update({
                    name,
                    description,
                    updated_at: new Date(Date.now()),
                    updated_by: request.user.id,
                })
                .returning(["id", "name", "project_id"]);

            await fastify.createAlert("update", "stakeholderGroup", groupName, id, project_id, request.user.id);
            return [id];
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
        "/:stakeholderGroupId/users/:accountId",
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
        "/:stakeholderGroupId/users/:accountId",
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

    const getStakeholderGroupReqgroupsSchema = {
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
        "/:stakeholderGroupId/reqgroups",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: getStakeholderGroupReqgroupsSchema,
        },
        async function (request, reply) {
            return await fastify.knex
                .from("reqgroup")
                .select("reqgroup.*", "per_project_unique_id.readable_id as ppuid", "reqgroup.id as id") // id overwrite must be at end
                .join("per_project_unique_id", "per_project_unique_id.id", "reqgroup.ppuid_id")
                .join("stakeholderGroup_reqgroup", "reqgroup.id", "stakeholderGroup_reqgroup.reqgroup_id")
                .where({ "stakeholderGroup_reqgroup.stakeholderGroup_id": request.params.stakeholderGroupId })
                .orderBy("ppuid", "asc");
        }
    );

    const deleteStakeholderGroupReqgroupSchema = {
        queryString: {},
        params: {
            type: "object",
            properties: {
                stakeholderGroupId: { type: "number" },
                reqgroupId: { type: "number" },
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
        "/:stakeholderGroupId/reqgroups/:reqgroupId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: deleteStakeholderGroupReqgroupSchema,
        },
        async function (request, reply) {
            await fastify
                .knex("stakeholderGroup_reqgroup")
                .where({
                    "stakeholderGroup_id": request.params.stakeholderGroupId,
                    "reqgroup_id": request.params.reqgroupId,
                }).del();
            return ["success"];
        }
    );
};
