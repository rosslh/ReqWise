module.exports = async function (fastify, opts) {
    const { Storage } = require('@google-cloud/storage');
    const storage = new Storage();

    const getModelSchema = {
        body: {},
        queryString: {},
        params: {
            type: "object",
            properties: {
                modelId: { type: "number" },
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
                type: "object",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" },
                    description: { type: "string" },
                    svg: { type: "string" },
                    project_id: { type: "number" }
                },
            },
        },
    };
    fastify.get(
        "/models/:modelId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: getModelSchema,
        },
        async function (request, reply) {
            return await fastify.knex
                .from("model")
                .select("*")
                .where({
                    id: request.params.modelId,
                })
                .first();
        }
    );


    const putModelSchema = {
        body: {
            type: "object",
            properties: {
                name: { type: "string" },
                description: { type: "string" },
                svg: { type: "string" },
                file: { type: "string" }
            }
        },
        queryString: {},
        params: {
            type: "object",
            properties: {
                modelId: { type: "number" },
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
        "/models/:modelId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: putModelSchema,
        },
        async function (request, reply) {
            const { name, description, svg, file } = request.body;
            const model = await fastify.knex
                .from("model")
                .select("*")
                .where({
                    id: request.params.modelId,
                })
                .first();
            if (model.type === "upload") {
                const data = Buffer.from(file.replace(/^data:.*\/.*;base64,/, ''), 'base64');
                const gcloudFile = await storage.bucket('user-file-storage').file(model.fileName);
                await gcloudFile.save(data);
                await gcloudFile.makePublic();
                console.log("new version uploaded");

                return await fastify
                    .knex("model")
                    .where("id", request.params.modelId)
                    .update({
                        name,
                        description,
                        updated_at: new Date(Date.now()),
                        updated_by: request.user.id,
                    })
                    .returning("id");
            }
            else {
                return await fastify
                    .knex("model")
                    .where("id", request.params.modelId)
                    .update({
                        name,
                        description,
                        svg,
                        updated_at: new Date(Date.now()),
                        updated_by: request.user.id,
                    })
                    .returning("id");
            }
        }
    );

    const deleteModelSchema = {
        body: {},
        queryString: {},
        params: {
            type: "object",
            properties: {
                modelId: { type: "number" },
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
        "/models/:modelId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: deleteModelSchema,
        },
        async function (request, reply) {
            const model = await fastify.knex
                .from("model")
                .select("*")
                .where({
                    id: request.params.modelId,
                })
                .first();

            if (model.type === "upload") {
                try {
                    await storage.bucket('user-file-storage').file(model.fileName).delete();
                }
                catch (e) {
                    console.error(e);
                }
            }

            await fastify
                .knex("model")
                .where("id", request.params.modelId)
                .del();
            return ["success"];
        }
    );
};
