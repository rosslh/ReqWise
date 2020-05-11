module.exports = async function (fastify, opts) {
    const sleep = ms => new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

    fastify.io.on('connection', async (socket) => {
        console.log('a user connected');

        socket.on('getNotifications', async ({ jwt, projectId }) => {
            let timestamp = Date.now();
            const user = fastify.jwt.verify(jwt);
            const interval = 6000;
            console.log(user);
            while (true) {
                await sleep(interval);
                const projectUpdated = !!(
                    await fastify.knex
                        .from("project")
                        .select("id")
                        .where({
                            "id": projectId
                        })
                        .where('reqgroups_updated_at', '>', new Date(timestamp))
                ).length;

                let updatedReqgroups = (
                    await fastify.knex
                        .from("reqgroup")
                        .select("id")
                        .where({
                            "project_id": projectId
                        })
                        .where('updated_at', '>', new Date(timestamp))
                        .where('updated_by', "!=", user.id)
                ).map(x => fastify.obfuscateId(x.id));

                let newReqversionReqgroups = (await fastify.knex
                    .from("reqversion")
                    .join("requirement", "requirement.id", "reqversion.requirement_id")
                    .join("reqgroup", "reqgroup.id", "requirement.reqgroup_id")
                    .select("reqgroup.id as id")
                    .where({
                        "reqgroup.project_id": projectId
                    })
                    .where('reqversion.created_at', '>', new Date(timestamp))
                    .where('account_id', "!=", user.id)
                ).map(x => fastify.obfuscateId(x.id));

                updatedReqgroups = Array.from(new Set(updatedReqgroups.concat(newReqversionReqgroups)));
                if (projectUpdated || updatedReqgroups.length) {
                    console.log(projectUpdated, updatedReqgroups)
                    socket.emit('message', JSON.stringify({
                        projectUpdated,
                        updatedReqgroups
                    }));
                }
                timestamp = Date.now();
            }
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    // fastify.get("/stream/comments/:reqversionId", {
    //     preValidation: [fastify.authenticateQueryString, fastify.isTeamMember],
    //     schema: commentStreamSchema,
    // }, function (req, res) {
    //     addHeaders(res);

    //     let timestamp = Date.now();
    //     let interval = 2000;
    //     res.sse({
    //         async*[Symbol.asyncIterator]() {
    //             for (let i = 0; i < 15; i++) { // expires after 30 seconds
    //                 await sleep(interval);
    //                 const newComments = (await fastify.knex
    //                     .from("comment")
    //                     .select(
    //                         "comment.*",
    //                         "account.name as authorName",
    //                         "account.email as authorEmail"
    //                     )
    //                     .join("account", "account.id", "=", "comment.account_id").where({
    //                         "comment.reqversion_id": req.params.reqversionId
    //                     })
    //                     .where('comment.created_at', '>', new Date(timestamp))
    //                 ).map(x => ({ ...x, id: fastify.obfuscateId(x.id) }));

    //                 if (newComments.length) {
    //                     yield {
    //                         id: String(i), data: JSON.stringify(newComments)
    //                     };
    //                 }
    //                 timestamp = Date.now();
    //             }
    //         }
    //     });
    // });
};