"use-strict";

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
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getUserclassSchema,
    },
    async function (request, reply) {
      const userclass = await fastify.knex
        .from("userclass")
        .select("userclass.*", "per_project_unique_id.readable_id as ppuid")
        .join("per_project_unique_id", "per_project_unique_id.id", "userclass.ppuid_id")
        .where("userclass.id", request.params.userclassId)
        .first();
      const latestReview = await fastify.getLatestReview("userclass", request.params.userclassId);
      return { ...userclass, latestReview };
    }
  );

  const getUserclassHistorySchema = {
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
    "/:userclassId/history",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getUserclassHistorySchema,
    },
    async function (request, reply) {
      let userclasses = await fastify.knex
        .from("userclass")
        .select("userclass.*", "stakeholderReview.created_at", "per_project_unique_id.readable_id as ppuid")
        .join("per_project_unique_id", "per_project_unique_id.id", "userclass.ppuid_id")
        .join("stakeholderReview", "stakeholderReview.id", "userclass.stakeholderReview_id")
        .where({
          "userclass.is_baseline": true,
          "stakeholderReview.entity_userclass_id": request.params.userclassId
        })
        .orderBy("stakeholderReview.created_at", "desc");

      return userclasses = await Promise.all(userclasses.map(async userclass => {
        const latestReview = await fastify.getReviewForBaseline("userclass", userclass.id);
        return { ...userclass, latestReview };
      }));
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
        .returning(["id", "name", "project_id"]);

      await fastify.updateReviews("userclass", id, request);
      await fastify.createAlert("update", "userclass", userclassName, id, project_id, request.user.id);
      return [id];
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
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
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
        .orderByRaw("coalesce(updated_at,created_at) desc");
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
