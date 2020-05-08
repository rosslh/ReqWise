module.exports = async function (fastify, opts) {

    const sleep = ms => new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

    const projectStreamSchema = {
        body: {},
        queryString: {
            type: "object",
            properties: {
                jwt: { type: "string" },
            },
            required: ["jwt"]
        },
        params: {
            type: "object",
            properties: {
                projectId: { type: "number" }
            },
            required: ["projectId"]
        },
        headers: {},
        response: {},
    };
    fastify.get("/stream/project/:projectId", {
        preValidation: [fastify.authenticateQueryString, fastify.isTeamMember],
        schema: projectStreamSchema,
    }, function (req, res) {
        let timestamp = Date.now();
        let interval = 6000;
        res.sse({
            async*[Symbol.asyncIterator]() {
                for (let i = 0; i < 10; i++) { // expires after one minute
                    await sleep(interval);

                    const projectUpdated = !!(
                        await fastify.knex
                            .from("project")
                            .select("id")
                            .where({
                                "id": req.params.projectId
                            })
                            .where('reqgroups_updated_at', '>', new Date(timestamp - interval))
                    ).length;

                    let updatedReqgroups = (
                        await fastify.knex
                            .from("reqgroup")
                            .select("id")
                            .where({
                                "project_id": req.params.projectId
                            })
                            .where('updated_at', '>', new Date(timestamp - interval))
                            .where('updated_by', "!=", req.user.id)
                    ).map(x => fastify.obfuscateId(x.id));

                    let newReqversionReqgroups = (await fastify.knex
                        .from("reqversion")
                        .join("requirement", "requirement.id", "reqversion.requirement_id")
                        .join("reqgroup", "reqgroup.id", "requirement.reqgroup_id")
                        .select("reqgroup.id as id")
                        .where({
                            "reqgroup.project_id": req.params.projectId
                        })
                        .where('reqversion.created_at', '>', new Date(timestamp - interval))
                        .where('account_id', "!=", req.user.id)
                    ).map(x => fastify.obfuscateId(x.id));

                    updatedReqgroups = Array.from(new Set(updatedReqgroups.concat(newReqversionReqgroups)));

                    if (projectUpdated || updatedReqgroups.length) {
                        yield {
                            id: String(i), data: JSON.stringify({
                                projectUpdated,
                                updatedReqgroups
                            })
                        };
                    }
                    timestamp = Date.now();
                }
            }
        });
    });

    const commentStreamSchema = {
        body: {},
        queryString: {
            type: "object",
            properties: {
                jwt: { type: "string" },
            },
            required: ["jwt"]
        },
        params: {
            type: "object",
            properties: {
                reqversionId: { type: "number" }
            },
            required: ["reqversionId"]
        },
        headers: {},
        response: {},
    };
    fastify.get("/stream/comments/:reqversionId", {
        preValidation: [fastify.authenticateQueryString, fastify.isTeamMember],
        schema: commentStreamSchema,
    }, function (req, res) {
        let timestamp = Date.now();
        let interval = 2000;
        res.sse({
            async*[Symbol.asyncIterator]() {
                for (let i = 0; i < 15; i++) { // expires after 30 seconds
                    await sleep(interval);
                    const newComments = (await fastify.knex
                        .from("comment")
                        .select(
                            "comment.*",
                            "account.name as authorName",
                            "account.email as authorEmail"
                        )
                        .join("account", "account.id", "=", "comment.account_id").where({
                            "comment.reqversion_id": req.params.reqversionId
                        })
                        .where('comment.created_at', '>', new Date(timestamp - interval))
                    ).map(x => ({ ...x, id: fastify.obfuscateId(x.id) }));

                    if (newComments.length) {
                        yield {
                            id: String(i), data: JSON.stringify(newComments)
                        };
                    }
                    timestamp = Date.now();
                }
            }
        });
    });
};