"use-strict";

module.exports = async function (fastify, opts) {
  const getReqgroupSchema = {
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
          isPrioritized: { type: "boolean" },
          is_draft: { type: "boolean" },
          is_baseline: { type: "boolean" },
          latestReview: {
            type: "object",
            properties: {
              status: { type: "string" },
              id: { type: ["number", "string"] },
            }
          },
          requirements: {
            type: "array", items: {
              type: "object",
              properties: {
                id: { type: ["number", "string"] },
                parent_requirement_id: { type: ["number", "string", "null"] },
                reqgroup_id: { type: ["number", "string"] },
                reqversion_id: { type: ["number", "string"] },
                project_id: { type: ["number", "string"] },
                account_id: { type: ["number", "string"] },
                priority: { type: "string" },
                status: { type: "string" },
                description: { type: "string" },
                created_at: { type: "string" },
                updated_at: { type: "string" },
                ppuid: { type: "number" },
                authorName: { type: "string" },
                updaterName: { type: "string" },
                depth: { type: "number" }
              }
            }
          },
        },
      },
    },
  };
  fastify.get(
    "/:reqgroupId",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getReqgroupSchema,
    },
    async function (request, reply) {

      return await fastify.getReqgroup(request.params.reqgroupId);
    }
  );

  const putReqgroupSchema = {
    body: {
      type: "object",
      properties: {
        name: { type: "string" },
        isPrioritized: { type: "boolean" },
        is_draft: { type: "boolean" }
      }
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
    "/:reqgroupId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: putReqgroupSchema,
    },
    async function (request, reply) {
      const { name, isPrioritized, is_draft } = request.body;

      if (typeof is_draft !== "undefined" && !is_draft) {
        // approve all requirements
        const reqgroup = await fastify.getReqgroup(request.params.reqgroupId);
        await Promise.all(reqgroup.requirements.map(async r => {
          await fastify
            .knex("reqversion")
            .where("id", r.reqversion_id)
            .update({
              status: "accepted"
            });
        }));
      }

      const [{ id, project_id }] = await fastify
        .knex("reqgroup")
        .where("id", request.params.reqgroupId)
        .update({
          name,
          isPrioritized,
          is_draft,
          updated_at: new Date(Date.now()),
          updated_by: request.user.id,
        })
        .returning(["id", "project_id"]);

      await fastify.updateReviews("reqgroup", id, request);
      await fastify.createAlert("update", "reqgroup", name, id, project_id, request.user.id);
      return [id];
    }
  );

  const deleteReqgroupSchema = {
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
    "/:reqgroupId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: deleteReqgroupSchema,
    },
    async function (request, reply) {
      const { isDeletable, project_id, name } = await fastify.knex
        .from("reqgroup")
        .select("*")
        .where({
          id: request.params.reqgroupId,
        })
        .first();

      if (isDeletable) {
        await fastify.knex("project").where({ id: project_id }).update({ reqgroups_updated_at: new Date(Date.now()) });
        await fastify
          .knex("reqgroup")
          .where("id", request.params.reqgroupId)
          .del();
        await fastify.createAlert("delete", "reqgroup", name, null, project_id, request.user.id);
        return ["success"];
      }
      else {
        reply.code(400).send("Cannot delete this reqgroup.");
      }
    }
  );

  const getRequirementsSchema = {
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
    "/:reqgroupId/requirements",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getRequirementsSchema,
    },
    async function (request, reply) {
      const result = await fastify.getReqgroup(request.params.reqgroupId);

      return result.requirements;
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
    "/:reqgroupId/requirements",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postRequirementSchema,
    },
    async function (request, reply) {
      const { description, priority, status, rationale, parent_requirement_id } = request.body;
      const { reqgroupId: reqgroup_id } = request.params;

      const { project_id, isMaxOneRequirement, slackAccessToken: token, name: reqgroup_name, ppuid: reqgroup_ppuid } = (
        await fastify.knex
          .from("reqgroup")
          .select("reqgroup.*", "team.slackAccessToken", "per_project_unique_id.readable_id as ppuid")
          .join("per_project_unique_id", "per_project_unique_id.id", "reqgroup.ppuid_id")
          .join('project', 'project.id', 'reqgroup.project_id')
          .join('team', 'team.id', 'project.team_id')
          .where({
            "reqgroup.id": reqgroup_id,
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
        const { id: ppuid_id } = await fastify.getNewPpuid(project_id);

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

        let slackMessageTs;
        if (token) {
          const channel = await fastify.slackGetChannelId(project_id);
          slackMessageTs = (await fastify.slack.chat.postMessage(fastify.slackPayloads.newRequirementMessage({ author_name: request.user.name, request, authorName: request.user.name, author_imageName: request.user.imageName, status, description, priority, project_id, requirement_id, ppuid_id, fastify, reqgroup_id, reqgroup_ppuid, reqgroup_name, rationale, token, channel }))).ts;
        }

        await fastify
          .knex("reqversion")
          .insert({
            requirement_id,
            account_id: request.user.id,
            updated_by: request.user.id,
            description,
            rationale,
            priority,
            status,
            slackMessageTs
          })
          .returning("id");

        await fastify
          .knex("reqgroup")
          .where("id", reqgroup_id)
          .update({
            updated_at: new Date(Date.now()),
            updated_by: request.user.id
          });

        await fastify.createAlert("create", "requirement", description, requirement_id, project_id, request.user.id);

        return requirement_id;
      }
      else {
        reply.code(400).send("Maximum number of requirements exceeded.");
      }
    }
  );

  const getReqgroupStakeholderGroupsSchema = {
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
    response: {},
  };
  fastify.get(
    "/:reqgroupId/stakeholders",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getReqgroupStakeholderGroupsSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("stakeholderGroup")
        .select("stakeholderGroup.*", "per_project_unique_id.readable_id as ppuid")
        .join("per_project_unique_id", "per_project_unique_id.id", "stakeholderGroup.ppuid_id")
        .join("stakeholderGroup_reqgroup", "stakeholderGroup.id", "stakeholderGroup_reqgroup.stakeholderGroup_id")
        .where({ "stakeholderGroup_reqgroup.reqgroup_id": request.params.reqgroupId })
        .orderByRaw("coalesce(updated_at,created_at) desc");
    });

  const postRequirementUserclassSchema = {
    body: {
      type: "object",
      properties: {
        stakeholderGroup_id: { type: ["number", "string"] }
      }
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
    response: {},
  };
  fastify.post(
    "/:reqgroupId/stakeholders",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postRequirementUserclassSchema,
    },
    async function (request, reply) {
      const { stakeholderGroup_id } = request.body;
      const { reqgroupId } = request.params;

      return await fastify
        .knex("stakeholderGroup_reqgroup")
        .insert({
          stakeholderGroup_id: fastify.deobfuscateId(stakeholderGroup_id),
          reqgroup_id: reqgroupId
        })
        .returning("id");
    }
  );

  const getReqgroupPromptsSchema = {
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
    response: {},
  };
  fastify.get(
    "/:reqgroupId/prompts",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getReqgroupPromptsSchema,
    },
    async function (request, reply) {
      const prompts = await fastify.knex
        .from("brainstormPrompt")
        .select("brainstormPrompt.*", "brainstormForm.is_open as is_open", "brainstormForm.is_draft as is_draft", "brainstormForm.is_public as is_public", "per_project_unique_id.readable_id as ppuid")
        .join("per_project_unique_id", "per_project_unique_id.id", "brainstormPrompt.ppuid_id")
        .join("brainstormForm", "brainstormForm.id", "brainstormPrompt.brainstormForm_id")
        .join("brainstormPrompt_reqgroup", "brainstormPrompt.id", "brainstormPrompt_reqgroup.brainstormPrompt_id")
        .where({ "brainstormPrompt_reqgroup.reqgroup_id": request.params.reqgroupId })
        .orderByRaw("created_at desc");
      return await Promise.all(prompts.map(p => fastify.getPromptDetails(p, request)));
    });

  const postRequirementPromptSchema = {
    body: {
      type: "object",
      properties: {
        prompt_id: { type: ["number", "string"] }
      }
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
    response: {},
  };
  fastify.post(
    "/:reqgroupId/prompts",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postRequirementPromptSchema,
    },
    async function (request, reply) {
      const { prompt_id } = request.body;
      const { reqgroupId } = request.params;

      return await fastify
        .knex("brainstormPrompt_reqgroup")
        .insert({
          brainstormPrompt_id: fastify.deobfuscateId(prompt_id),
          reqgroup_id: reqgroupId
        })
        .returning("id");
    }
  );

  const getReqgroupHistorySchema = {
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
            project_id: { type: "number" },
            name: { type: "string" },
            description: { type: "string" },
            ppuid: { type: "number" },
            type: { type: "string" },
            isDeletable: { type: "boolean" },
            isMaxOneRequirement: { type: "boolean" },
            isPrioritized: { type: "boolean" },
            is_draft: { type: "boolean" },
            is_baseline: { type: "boolean" },
            latestReview: {
              type: "object",
              properties: {
                status: { type: "string" },
                id: { type: ["number", "string"] },
              }
            },
            requirements: {
              type: "array", items: {
                type: "object",
                properties: {
                  id: { type: ["number", "string"] },
                  parent_requirement_id: { type: ["number", "string", "null"] },
                  reqgroup_id: { type: ["number", "string"] },
                  reqversion_id: { type: ["number", "string"] },
                  project_id: { type: ["number", "string"] },
                  account_id: { type: ["number", "string"] },
                  priority: { type: "string" },
                  status: { type: "string" },
                  description: { type: "string" },
                  created_at: { type: "string" },
                  updated_at: { type: "string" },
                  ppuid: { type: "number" },
                  authorName: { type: "string" },
                  updaterName: { type: "string" },
                  depth: { type: "number" }
                }
              }
            }
          },
        },
      },
    },
  };
  fastify.get(
    "/:reqgroupId/history",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getReqgroupHistorySchema,
    },
    async function (request, reply) {
      let reqgroups = await fastify.knex
        .from("reqgroup")
        .select("reqgroup.*", "stakeholderReview.created_at")
        .join("stakeholderReview", "stakeholderReview.id", "reqgroup.stakeholderReview_id")
        .where({
          "reqgroup.is_baseline": true,
          "stakeholderReview.entity_reqgroup_id": request.params.reqgroupId
        })
        .orderBy("stakeholderReview.created_at", "desc");

      return reqgroups = await Promise.all(reqgroups.map(async rg => await fastify.getReqgroup(rg.id)));
    }
  );
};
