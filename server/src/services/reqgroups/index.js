module.exports = async function (fastify, opts) {
  const getReqgroupSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        reqgroupId: { type: "number" },
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
    "/reqgroups/:reqgroupId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getReqgroupSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("reqgroup")
        .select("*", "per_project_unique_id as ppuid")
        .where({
          id: request.params.reqgroupId,
        })
        .first();
    }
  );

  const putReqgroupSchema = {
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
        reqgroupId: { type: "number" },
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
    "/reqgroups/:reqgroupId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: putReqgroupSchema,
    },
    async function (request, reply) {
      const { name } = request.body;
      return await fastify
        .knex("reqgroup")
        .where("id", request.params.reqgroupId)
        .update({
          name,
        })
        .returning("id");
    }
  );

  const deleteReqgroupSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        reqgroupId: { type: "number" },
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
    "/reqgroups/:reqgroupId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: deleteReqgroupSchema,
    },
    async function (request, reply) {
      const { isDeletable } = await fastify.knex
        .from("reqgroup")
        .select("*")
        .where({
          id: request.params.reqgroupId,
        })
        .first();

      if (isDeletable) {
        await fastify
          .knex("requirement")
          .where("reqgroup_id", request.params.reqgroupId)
          .update({ is_archived: true });
        await fastify
          .knex("reqgroup")
          .where("id", request.params.reqgroupId)
          .del();
        return ["success"];
      }
      else {
        reply.code(400).send("Cannot delete this reqgroup.")
      }
    }
  );

  const getRequirementsSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
        reqgroupId: { type: "number" },
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
    "/reqgroups/:reqgroupId/requirements",
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
        .where("reqgroup_id", request.params.reqgroupId)
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
      required: ["description", "status", "rationale"],
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        reqgroupId: { type: "number" },
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
    "/reqgroups/:reqgroupId/requirements",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postRequirementSchema,
    },
    async function (request, reply) {
      const { description, priority, status, rationale } = request.body;
      const { reqgroupId: reqgroup_id } = request.params;

      const { project_id, isMaxOneRequirement } = (
        await fastify.knex
          .from("reqgroup")
          .select("*")
          .where({
            id: reqgroup_id,
          })
          .first()
      );

      const numRequirements = isMaxOneRequirement && (
        await fastify.knex
          .from("requirement")
          .select("id")
          .where({
            reqgroup_id
          })
      ).length;

      if (!isMaxOneRequirement || numRequirements === 0) {
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
      else {
        reply.code(400).send("Maximum number of requirements exceeded.")
      }
    }
  );
};
