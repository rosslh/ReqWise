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
          isDeletable: { type: "boolean" },
          isMaxOneRequirement: { type: "boolean" },
          isPrioritized: { type: "boolean" }
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
        .select("*", "reqgroup.id as id", "per_project_unique_id.readable_id as ppuid")
        .where({
          "reqgroup.id": request.params.reqgroupId,
        })
        .join("per_project_unique_id", "per_project_unique_id.id", "reqgroup.ppuid_id")
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
          updated_at: new Date(Date.now()),
          updated_by: request.user.id,
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
      const { isDeletable, project_id } = await fastify.knex
        .from("reqgroup")
        .select("*")
        .where({
          id: request.params.reqgroupId,
        })
        .first();

      if (isDeletable) {
        await fastify.knex("project").where({ id: project_id }).update({ reqgroups_updated_at: new Date(Date.now()) });
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
      // 200: {
      //   type: "array",
      //   items: {
      //     type: "object",
      //     properties: {
      //       id: { type: "number" },
      //       reqgroup_id: { type: "number" },
      //       project_id: { type: "number" },
      //       ppuid: { type: "number" },
      //       is_archived: { type: "boolean" },
      //       account_id: { type: "number" },
      //       priority: { type: "string" },
      //       status: { type: "string" },
      //       description: { type: "string" },
      //       created_at: { type: "string" },
      //       parent_requirement_id: {
      //         type: "number"
      //       }
      //     },
      //   },
      // },
    },
  };
  fastify.get(
    "/reqgroups/:reqgroupId/requirements",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getRequirementsSchema,
    },
    async function (request, reply) {
      // TODO: Make recursive: http://knexjs.org/#Builder-withRecursive

      const getReqversion = function () {
        this.on("requirement.id", "=", "reqversion.requirement_id").andOn(
          "reqversion.created_at",
          "=",
          fastify.knex.raw(
            "(select max(created_at) from reqversion where reqversion.requirement_id = requirement.id)"
          )
        );
      };

      const selectColumns = [
        "requirement.id",
        "requirement.parent_requirement_id",
        "requirement.reqgroup_id",
        "requirement.project_id",
        "requirement.is_archived",
        "reqversion.account_id",
        "reqversion.priority",
        "reqversion.status",
        "reqversion.description",
        "reqversion.created_at",
        "per_project_unique_id.readable_id as ppuid",
        "account.name as author"
      ]

      const result = fastify.knex.withRecursive('ancestors', (qb) => {
        qb.select(...selectColumns, fastify.knex.raw("0 as depth"), fastify.knex.raw("LPAD(per_project_unique_id.readable_id::text, 5, '0') as hierarchical_id")).from('requirement')
          .where('requirement.parent_requirement_id', null)
          .andWhere("reqgroup_id", request.params.reqgroupId)
          .andWhere("is_archived", false)
          .join("reqversion", getReqversion)
          .join("account", "account.id", "reqversion.account_id")
          .join("per_project_unique_id", "per_project_unique_id.id", "requirement.ppuid_id")
          .union((qb) => {
            qb.select(...selectColumns, fastify.knex.raw("ancestors.depth + 1"), fastify.knex.raw("concat(ancestors.hierarchical_id, '-', LPAD(per_project_unique_id.readable_id::text, 5, '0')) as hierarchical_id")).from('requirement')
              .join("per_project_unique_id", "per_project_unique_id.id", "requirement.ppuid_id")
              .join('ancestors', 'ancestors.id', 'requirement.parent_requirement_id').join("reqversion", getReqversion)
              .join("account", "account.id", "reqversion.account_id")
          })
      }).select('*').from('ancestors').orderBy('hierarchical_id');

      return await result;
    }
  );

  const postRequirementSchema = {
    body: {
      type: "object",
      properties: {
        description: { type: "string" },
        priority: { type: "string" },
        status: { type: "string" },
        rationale: { type: "string" },
        parent_requirement_id: { type: "string" }
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
      const { description, priority, status, rationale, parent_requirement_id } = request.body;
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
              .knex("per_project_unique_id")
              .where({ project_id })
              .max("readable_id")
              .first()
          ).max || 0;

        const ppuid_id = (await fastify
          .knex("per_project_unique_id")
          .insert({
            project_id,
            readable_id: maxPpuid + 1
          })
          .returning("id"))[0];

        const requirement_id = (
          await fastify
            .knex("requirement")
            .insert({
              reqgroup_id,
              project_id,
              ppuid_id,
              parent_requirement_id
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
