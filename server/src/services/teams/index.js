module.exports = async function(fastify, opts) {
  const postTeamSchema = {
    body: {
      type: "object",
      required: ["name", "description"],
      properties: {
        name: { type: "string" },
        description: { type: "string" }
      }
    },
    queryString: {},
    params: {},
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" },
        "Content-Type": { type: "string" }
      },
      required: ["Authorization", "Content-Type"]
    },
    response: {
      200: {
        type: "object",
        properties: {
          team_id: { type: "number" }
        }
      }
    }
  };
  fastify.post(
    "/teams",
    {
      preValidation: [fastify.authenticate],
      schema: postTeamSchema
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

      return { team_id };
    }
  );

  const getTeamSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" }
      }
    },
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" }
      },
      required: ["Authorization"]
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "number" },
          name: { type: "string" },
          description: { type: "string" }
        }
      }
    }
  };
  fastify.get(
    "/teams/:teamId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getTeamSchema
    },
    async function(request, reply) {
      return await fastify.knex
        .from("team")
        .select("id", "name", "description")
        .where("id", request.params.teamId)
        .first();
    }
  );

  const putTeamSchema = {
    body: {
      type: "object",
      required: ["name", "description"],
      properties: {
        name: { type: "string" },
        description: { type: "string" }
      }
    },
    queryString: {},
    params: {},
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" },
        "Content-Type": { type: "string" }
      },
      required: ["Authorization", "Content-Type"]
    },
    response: {
      200: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" }
        }
      }
    }
  };

  fastify.put(
    "/teams/:teamId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: putTeamSchema
    },
    async function(request, reply) {
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
    params: {},
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" }
      },
      required: ["Authorization"]
    },
    response: {
      200: {
        type: "array",
        maxItems: 1,
        items: { type: "string" }
      }
    }
  };

  fastify.delete(
    "/teams/:teamId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: deleteTeamSchema
    },
    async function(request, reply) {
      // TODO: Ensure you also delete dependent entities
      await fastify
        .knex("team")
        .where("id", request.params.teamId)
        .del();
      return ["success"];
    }
  );

  const getTeamMembersSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" }
      }
    },
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" }
      },
      required: ["Authorization"]
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
            is_admin: { type: "boolean" }
          },
          required: ["id", "name", "email", "is_admin"]
        }
      }
    }
  };
  fastify.get(
    "/teams/:teamId/members",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getTeamMembersSchema
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

  const getTeamProjectsSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" }
      }
    },
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" }
      },
      required: ["Authorization"]
    },
    response: {
      200: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "number" },
            name: { type: "string" }
          },
          required: ["id", "name"]
        }
      }
    }
  };
  fastify.get(
    "/teams/:teamId/projects",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getTeamProjectsSchema
    },
    async function(request, reply) {
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
        name: { type: "string" }
      }
    },
    queryString: {},
    params: {},
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" },
        "Content-Type": { type: "string" }
      },
      required: ["Authorization", "Content-Type"]
    },
    response: {
      200: {
        type: "array",
        maxItems: 1,
        items: { type: "number" }
      }
    }
  };
  fastify.post(
    "/teams/:teamId/projects",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postProjectSchema
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
