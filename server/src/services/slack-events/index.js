"use strict"

module.exports = async (fastify, opts) => {
    const postEventSchema = {
        body: {},
        queryString: {},
        params: {},
        headers: {
            type: "object",
            properties: {
                "Content-Type": { type: "string" },
            },
            required: ["Content-Type"],
        },
        response: {},
    };
    fastify.post(
        "/slack/events",
        { schema: postEventSchema },
        async (request, reply) => {
            if (request.body.challenge) {
                return request.body.challenge;
            }
            console.log(request.body);
            return ["success"];
        }
    );
};
