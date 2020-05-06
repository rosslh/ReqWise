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
    fastify.get("/stream/:projectId", {
        preValidation: [fastify.authenticateQueryString, fastify.isTeamMember],
        schema: streamSchema,
    }, function (req, res) {
        res.sse({
            async*[Symbol.asyncIterator]() {
                for (let i = 0; i < 10; i++) {
                    await sleep(2000);
                    yield { id: String(i), data: i };
                }
            }
        });
    });

};