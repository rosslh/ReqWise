module.exports = async function (fastify, opts) {
  const getFeatureSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        featureId: { type: "number" },
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
          project_id: { type: "number" },
          name: { type: "string" },
          description: { type: "string" },
          ppuid: { type: "number" },
          type: { type: "string" },
        },
      },
    },
  };
  fastify.get(
    "/features/:featureId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getFeatureSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("reqgroup")
        .select("*", "per_project_unique_id as ppuid")
        .where({
          id: request.params.featureId,
        })
        .first();
    }
  );

  const putFeatureSchema = {
    body: {
      type: "object",
      properties: {
        name: { type: "string" },
      },
      required: ["name"],
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        featureId: { type: "number" },
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
    "/features/:featureId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: putFeatureSchema,
    },
    async function (request, reply) {
      const { name } = request.body;
      return await fastify
        .knex("reqgroup")
        .where("id", request.params.featureId)
        .update({
          name,
        })
        .returning("id");
    }
  );

  const deleteFeatureSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        featureId: { type: "number" },
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
    "/features/:featureId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: deleteFeatureSchema,
    },
    async function (request, reply) {
      await fastify
        .knex("requirement")
        .where("reqgroup_id", request.params.featureId)
        .update({ is_archived: true });
      await fastify
        .knex("reqgroup")
        .where("id", request.params.featureId)
        .del();
      return ["success"];
    }
  );

  const getRequirementsSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        featureId: { type: "number" },
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
            reqgroup_id: { type: "number" },
            project_id: { type: "number" },
            ppuid: { type: "number" },
            is_archived: { type: "boolean" },
            account_id: { type: "number" },
            priority: { type: "string" },
            status: { type: "string" },
            description: { type: "string" },
            created_at: { type: "string" },
          },
        },
      },
    },
  };
  fastify.get(
    "/features/:featureId/requirements",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getRequirementsSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("requirement")
        .select(
          "requirement.id",
          "requirement.reqgroup_id",
          "requirement.project_id",
          "requirement.per_project_unique_id as ppuid",
          "requirement.is_archived",
          "reqversion.account_id",
          "reqversion.priority",
          "reqversion.status",
          "reqversion.description",
          "reqversion.created_at"
        )
        .where("reqgroup_id", request.params.featureId)
        .andWhere("is_archived", false)
        .join("reqversion", function () {
          this.on("requirement.id", "=", "reqversion.requirement_id").andOn(
            "reqversion.created_at",
            "=",
            fastify.knex.raw(
              "(select max(created_at) from reqversion where reqversion.requirement_id = requirement.id)"
            )
          );
        });
    }
  );

  const postRequirementSchema = {
    body: {
      type: "object",
      properties: {
        description: { type: "string" },
        priority: { type: "string" },
        status: { type: "string" },
        ratonale: { type: "string" },
      },
      required: ["description", "priority", "status", "rationale"],
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        featureId: { type: "number" },
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
        type: "number",
      },
    },
  };
  fastify.post(
    "/features/:featureId/requirements",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postRequirementSchema,
    },
    async function (request, reply) {
      const { description, priority, status, rationale } = request.body;
      const { featureId: reqgroup_id } = request.params;

      const project_id = (
        await fastify.knex
          .from("reqgroup")
          .select("*")
          .where({
            id: reqgroup_id,
          })
          .first()
      ).project_id;

      const maxPpuid =
        (
          await fastify
            .knex("requirement")
            .where({ project_id })
            .max("per_project_unique_id")
            .first()
        ).max || 0;

      const requirement_id = (
        await fastify
          .knex("requirement")
          .insert({
            reqgroup_id,
            project_id,
            per_project_unique_id: maxPpuid + 1,
          })
          .returning("id")
      )[0];
      await fastify
        .knex("reqversion")
        .insert({
          requirement_id,
          account_id: request.user.id,
          description,
          rationale,
          priority,
          status,
        })
        .returning("id");

      return requirement_id;
    }
  );
};
