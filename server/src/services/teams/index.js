module.exports = async function (fastify, opts) {
  const postTeamSchema = {
    body: {
      type: "object",
      required: ["name", "description"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
    "/teams",
    {
      preValidation: [fastify.authenticate],
      schema: postTeamSchema,
    },
    async function (request, reply) {
      const { name, description } = request.body;

      const [team_id] = await fastify
        .knex("team")
        .insert({
          name,
          description,
        })
        .returning("id");

      await fastify.knex("account_team").insert({
        account_id: request.user.id,
        team_id,
        isAdmin: true,
        isOwner: true,
      });

      return { team_id };
    }
  );

  const getTeamSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
          isAdmin: { type: "boolean" },
        },
        required: ["id", "name", "description", "isAdmin"],
      },
    },
  };
  fastify.get(
    "/teams/:teamId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getTeamSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("team")
        .select(
          "team.id as id",
          "team.name as name",
          "team.description as description",
          "account_team.isAdmin as isAdmin"
        )
        .where("team.id", request.params.teamId)
        .join("account_team", {
          "account_team.team_id": "team.id",
          "account_team.account_id": request.user.id,
        })
        .first();
    }
  );

  const putTeamSchema = {
    body: {
      type: "object",
      required: ["name", "description"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
          name: { type: "string" },
          description: { type: "string" },
        },
      },
    },
  };

  fastify.put(
    "/teams/:teamId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: putTeamSchema,
    },
    async function (request, reply) {
      const { name, description } = request.body;
      if (!name || !description) {
        reply.code(400).send("Missing name or description");
        return;
      }
      return (
        await fastify
          .knex("team")
          .update({ name, description })
          .where("id", request.params.teamId)
          .returning(["name", "description"])
      )[0];
    }
  );

  const deleteTeamSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
    "/teams/:teamId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: deleteTeamSchema,
    },
    async function (request, reply) {
      // TODO: Ensure you also delete dependent entities
      await fastify.knex("team").where("id", request.params.teamId).del();
      return ["success"];
    }
  );

  const getTeamMembersSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
        items: {
          type: "object",
          properties: {
            id: { type: "number" },
            name: { type: "string" },
            email: { type: "string" },
            isAdmin: { type: "boolean" },
            isOwner: { type: "boolean" },
          },
          required: ["id", "name", "email", "isAdmin", "isOwner"],
        },
      },
    },
  };
  fastify.get(
    "/teams/:teamId/members",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getTeamMembersSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("account_team")
        .select(
          "account.id",
          "account.name",
          "account.email",
          "account_team.isAdmin",
          "account_team.isOwner"
        )
        .where("team_id", request.params.teamId)
        .join("account", "account.id", "=", "account_team.account_id");
    }
  );

  const getTeamInvitesSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
        items: {
          type: "object",
          properties: {
            id: { type: "number" },
            inviteeEmail: { type: "string" },
            isAdmin: { type: "boolean" },
          },
          required: ["inviteeEmail", "isAdmin", "id"],
        },
      },
    },
  };
  fastify.get(
    "/teams/:teamId/invites",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getTeamInvitesSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("teamInvite")
        .select("*")
        .where("team_id", request.params.teamId);
    }
  );

  const postTeamInviteSchema = {
    body: {
      type: "object",
      required: ["inviteeEmail", "isAdmin"],
      properties: {
        inviteeEmail: { type: "string" },
        isAdmin: { type: "boolean" },
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
        type: "array",
        maxItems: 1,
        items: { type: "string" },
      },
      409: {
        type: "array",
        maxItems: 1,
        items: { type: "string" },
      },
    },
  };
  fastify.post(
    "/teams/:teamId/invites",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: postTeamInviteSchema,
    },
    async function (request, reply) {
      const { inviteeEmail, isAdmin } = request.body;

      const memberAlreadyExists = (
        await fastify.knex
          .from("account")
          .select("account.id")
          .where({
            email: inviteeEmail,
            "account_team.team_id": request.params.teamId,
          })
          .join("account_team", "account_team.account_id", "account.id")
      ).length;

      if (memberAlreadyExists) {
        reply.code(409);
        return ["Member already exists"];
      }

      const inviteAlreadyExists = (
        await fastify.knex.from("teamInvite").select("id").where({
          inviteeEmail,
          team_id: request.params.teamId,
        })
      ).length;

      if (inviteAlreadyExists) {
        reply.code(409);
        return ["Invite already exists"];
      }

      await fastify
        .knex("teamInvite")
        .insert({
          inviteeEmail,
          isAdmin,
          inviter_id: request.user.id,
          team_id: request.params.teamId,
        })
        .returning("id");

      return ["success"];
    }
  );

  const deleteInviteSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
        inviteId: { type: "number" },
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
    "/teams/:teamId/invites/:inviteId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: deleteInviteSchema,
    },
    async function (request, reply) {
      await fastify
        .knex("teamInvite")
        .where({ team_id: request.params.teamId, id: request.params.inviteId })
        .del();
      return ["success"];
    }
  );

  const deleteMemberSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
        memberId: { type: "number" },
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
    "/teams/:teamId/members/:memberId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: deleteMemberSchema,
    },
    async function (request, reply) {
      const membership = await fastify
        .knex("account_team")
        .select("*")
        .where({
          account_id: request.params.memberId,
          team_id: request.params.teamId,
        })
        .first();

      if (!membership.isOwner) {
        await fastify
          .knex("account_team")
          .select("*")
          .where({
            account_id: request.params.memberId,
            team_id: request.params.teamId,
            isOwner: false,
          })
          .del();
        return ["success"];
      }
      reply.code(400);
      return ["owner cannot leave team"];
    }
  );

  const getTeamProjectsSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
        items: {
          type: "object",
          properties: {
            id: { type: "number" },
            name: { type: "string" },
          },
          required: ["id", "name"],
        },
      },
    },
  };
  fastify.get(
    "/teams/:teamId/projects",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getTeamProjectsSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("project")
        .select("id", "name")
        .where("team_id", request.params.teamId);
    }
  );

  const postProjectSchema = {
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
        type: "array",
        maxItems: 1,
        items: { type: "number" },
      },
    },
  };
  fastify.post(
    "/teams/:teamId/projects",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postProjectSchema,
    },
    async function (request, reply) {
      const { name } = request.body;

      return await fastify
        .knex("project")
        .insert({
          name,
          team_id: request.params.teamId,
        })
        .returning("id");
    }
  );
};
