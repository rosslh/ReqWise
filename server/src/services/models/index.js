module.exports = async function (fastify, opts) {
    const { Storage } = require('@google-cloud/storage');
    const { v4: uuidv4 } = require('uuid');
    const storage = new Storage();

    const getFileSchema = {
        body: {},
        queryString: {},
        params: {
            type: "object",
            properties: {
                fileId: { type: "number" },
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
        "/files/:fileId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: getFileSchema,
        },
        async function (request, reply) {
            return await fastify.knex
                .from("file")
                .select("*")
                .where({
                    id: request.params.fileId,
                })
                .first();
        }
    );


    const putFileSchema = {
        body: {
            type: "object",
            properties: {
                name: { type: "string" },
                description: { type: "string" },
                svg: { type: "string" },
                file: { type: "string" },
                fileName: { type: "string" },
            }
        },
        queryString: {},
        params: {
            type: "object",
            properties: {
                fileId: { type: "number" },
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
        "/files/:fileId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: putFileSchema,
        },
        async function (request, reply) {
            const { name, description, svg, file, fileName } = request.body;
            const currentFile = await fastify.knex
                .from("file")
                .select("*")
                .where({
                    id: request.params.fileId,
                })
                .first();
            if (currentFile.type === "upload") {
                const data = Buffer.from(file.replace(/^data:.*\/.*;base64,/, ''), 'base64');
                const uploadedFileName = `${uuidv4()}-${fileName.replace(/[^a-zA-Z0-9_. -]/g, '')}`; // remove illegal characters
                const gcloudFile = await storage.bucket('user-file-storage').file(uploadedFileName);
                await gcloudFile.save(data);
                await gcloudFile.makePublic();
                await storage.bucket('user-file-storage').file(currentFile.fileName).delete();

                return await fastify
                    .knex("file")
                    .where("id", request.params.fileId)
                    .update({
                        name,
                        description,
                        updated_at: new Date(Date.now()),
                        updated_by: request.user.id,
                        fileName: uploadedFileName
                    })
                    .returning("id");
            }
            else {
                return await fastify
                    .knex("file")
                    .where("id", request.params.fileId)
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

    const deleteFileSchema = {
        body: {},
        queryString: {},
        params: {
            type: "object",
            properties: {
                fileId: { type: "number" },
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
        "/files/:fileId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember],
            schema: deleteFileSchema,
        },
        async function (request, reply) {
            const file = await fastify.knex
                .from("file")
                .select("*")
                .where({
                    id: request.params.fileId,
                })
                .first();

            if (file.type === "upload") {
                try {
                    await storage.bucket('user-file-storage').file(file.fileName).delete();
                }
                catch (e) {
                    console.error(e);
                }
            }

            await fastify
                .knex("file")
                .where("id", request.params.fileId)
                .del();
            return ["success"];
        }
    );
};
