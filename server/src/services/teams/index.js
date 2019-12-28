module.exports = async function(fastify, opts) {
    /* This is a protected route */
    fastify.post(
        "/teams",
        {
            preValidation: [fastify.authenticate]
        },
        async function(request, reply) {
            const { name, description } = request.body;

            const [team_id] = await fastify
                .knex("team")
                .insert({
                    name,
                    description
                })
                .returning("id");

            await fastify.knex("account_team").insert({
                account_id: request.user.id,
                team_id,
                is_admin: true
            });

            return ["success"];
        }
    );

    fastify.get(
        "/teams/:teamId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember]
        },
        async function(request, reply) {
            return await fastify.knex
                .from("team")
                .select("id", "name", "description")
                .where("id", request.params.teamId)
                .first();
        }
    );

    fastify.put(
        "/teams/:teamId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamAdmin]
        },
        async function(request, reply) {
            const { name, description } = request.body;
            if (!name || !description) {
                reply.code = 400;
                return "Missing name or description";
            }
            return await fastify
                .knex("team")
                .update({ name, description })
                .where("id", request.params.teamId)
                .returning(["name", "description"]);
        }
    );

    fastify.delete(
        "/teams/:teamId",
        {
            preValidation: [fastify.authenticate, fastify.isTeamAdmin]
        },
        async function(request, reply) {}
    );

    fastify.get(
        "/teams/:teamId/members",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember]
        },
        async function(request, reply) {
            return await fastify.knex
                .from("account_team")
                .select(
                    "account.id",
                    "account.name",
                    "account.email",
                    "account_team.is_admin"
                )
                .where("team_id", request.params.teamId)
                .join("account", "account.id", "=", "account_team.account_id");
        }
    );

    fastify.get(
        "/teams/:teamId/projects",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember]
        },
        async function(request, reply) {
            return await fastify.knex
                .from("project")
                .select("id", "name")
                .where("team_id", request.params.teamId);
        }
    );

    fastify.post(
        "/teams/:teamId/projects",
        {
            preValidation: [fastify.authenticate, fastify.isTeamMember]
        },
        async function(request, reply) {
            const { name } = request.body;

            return await fastify
                .knex("project")
                .insert({
                    name,
                    team_id: request.params.teamId
                })
                .returning("id");
        }
    );
};
