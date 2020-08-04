module.exports = async function (fastify, opts) {
  const getUserclassSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        userclassId: { type: "number" },
      },
    },
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" },
      },
      required: ["Authorization"],
    },
    response: {},
  };
  fastify.get(
    "/:userclassId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getUserclassSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("userclass")
        .select("userclass.*", "per_project_unique_id.readable_id as ppuid")
        .join("per_project_unique_id", "per_project_unique_id.id", "userclass.ppuid_id")
        .where("userclass.id", request.params.userclassId)
        .first();
    }
  );

  const getUserclassChampions = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        userclassId: { type: "number" },
      },
    },
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" },
      },
      required: ["Authorization"],
    },
    response: {},
  };
  fastify.get(
    "/:userclassId/champions",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getUserclassChampions,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("account_userclass")
        .select("*", "account.*")
        .join("account", "account.id", "account_userclass.account_id")
        .where("userclass_id", request.params.userclassId);
    }
  );

  const postChampionSchema = {
    body: {
      type: "object",
      properties: {
        account_id: { type: ["number", "string"] }
      }
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        userclassId: { type: "number" },
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
    "/:userclassId/champions",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postChampionSchema,
    },
    async function (request, reply) {
      const { account_id, description } = request.body;
      const { userclassId } = request.params;

      return await fastify
        .knex("account_userclass")
        .insert({
          account_id: fastify.deobfuscateId(account_id),
          userclass_id: userclassId,
          description
        })
        .returning("id");
    }
  );

  const deleteUserclassSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        userclassId: { type: "number" },
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
    "/:userclassId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: deleteUserclassSchema,
    },
    async function (request, reply) {
      const userclass = await fastify.knex
        .from("userclass")
        .select("userclass.*")
        .where("userclass.id", request.params.userclassId)
        .first();
      await fastify
        .knex("userclass")
        .where("id", request.params.userclassId)
        .del();
      await fastify.createAlert("delete", "userclass", userclass.name, null, userclass.project_id, request.user.id);
      return ["success"];
    }
  );

  const putUserclassSchema = {
    body: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        persona: { type: "string" },
        importance: { type: "string" },
        is_draft: { type: "boolean" },
      },
      required: ["name"],
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        userclassId: { type: "number" },
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
    "/:userclassId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: putUserclassSchema,
    },
    async function (request, reply) {
      const { name, description, persona, importance, is_draft } = request.body;
      const [{ id, name: userclassName, project_id }] = await fastify
        .knex("userclass")
        .where("id", request.params.userclassId)
        .update({
          name,
          description,
          persona,
          importance,
          is_draft,
          updated_at: new Date(Date.now()),
          updated_by: request.user.id,
        })
        .returning(["id", "name"]);
      await fastify.createAlert("update", "requirement", userclassName, id, project_id, request.user.id);
      return [id];
    }
  );

  const putChampionSchema = {
    body: {
      type: "object",
      properties: {
        description: { type: "string" },
      },
      required: ["description"],
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        userclassId: { type: "number" },
        accountId: { type: "number" },
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
    "/:userclassId/champions/:accountId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: putChampionSchema,
    },
    async function (request, reply) {
      const { description } = request.body;
      return await fastify
        .knex("account_userclass")
        .where({
          "userclass_id": request.params.userclassId,
          "account_id": request.params.accountId,
        })
        .update({
          description
        })
        .returning("id");
    }
  );

  const deleteChampionSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        userclassId: { type: "number" },
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
    "/:userclassId/champions/:accountId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: deleteChampionSchema,
    },
    async function (request, reply) {
      await fastify
        .knex("account_userclass")
        .where({
          "userclass_id": request.params.userclassId,
          "account_id": request.params.accountId,
        }).del();
      return ["success"];
    }
  );

  const getReqversion = function () {
    this.on("requirement.id", "=", "reqversion.requirement_id").andOn(
      "reqversion.created_at",
      "=",
      fastify.knex.raw(
        "(select max(created_at) from reqversion where reqversion.requirement_id = requirement.id)"
      )
    );
  };
  const getUserclassRequirementsSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        userclassId: { type: "number" },
      },
    },
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" },
      },
      required: ["Authorization"],
    },
    response: {},
  };
  fastify.get(
    "/:userclassId/requirements",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getUserclassRequirementsSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("requirement")
        .select("requirement.*", "reqversion.*", "per_project_unique_id.readable_id as ppuid", "requirement.id as id") // id overwrite must be at end
        .join("reqversion", getReqversion)
        .join("per_project_unique_id", "per_project_unique_id.id", "requirement.ppuid_id")
        .join("requirement_userclass", "requirement.id", "requirement_userclass.requirement_id")
        .where({ "requirement_userclass.userclass_id": request.params.userclassId })
        .orderBy("ppuid", "asc");
    }
  );

  const deleteUserclassRequirementSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        userclassId: { type: "number" },
        requirementId: { type: "number" },
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
    "/:userclassId/requirements/:requirementId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: deleteUserclassRequirementSchema,
    },
    async function (request, reply) {
      await fastify
        .knex("requirement_userclass")
        .where({
          "userclass_id": request.params.userclassId,
          "requirement_id": request.params.requirementId,
        }).del();
      return ["success"];
    }
  );
};
