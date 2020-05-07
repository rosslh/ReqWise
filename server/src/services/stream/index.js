module.exports = async function (fastify, opts) {

    const sleep = ms => {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    const streamSchema = {
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
        schema: streamSchema,
    }, function (req, res) {
        let timestamp = Date.now();
        console.log(req.user);
        res.sse({
            async*[Symbol.asyncIterator]() {
                for (let i = 0; i < 20; i++) {
                    await sleep(2000);

                    const projectUpdated = !!(
                        await fastify.knex
                            .from("project")
                            .select("id")
                            .where({
                                "id": req.params.projectId
                            })
                            .where('reqgroups_updated_at', '>', new Date(timestamp))
                    ).length;

                    let updatedReqgroups = (
                        await fastify.knex
                            .from("reqgroup")
                            .select("id")
                            .where({
                                "project_id": req.params.projectId
                            })
                            .where('updated_at', '>', new Date(timestamp))
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
                        .where('reqversion.created_at', '>', new Date(timestamp))
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

};