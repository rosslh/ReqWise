module.exports = async function (fastify, opts) {
  const getRequirementSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
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
        type: "object",
        properties: {
          id: { type: "number" },
          parent_requirement_id: { type: ["number", "null"] },
          reqgroupName: { type: "string" },
          reqgroup_ppuid: { type: "number" },
          parent_ppuid: { type: "number" },

          reqgroup_id: { type: "number" },
          project_id: { type: "number" },
          is_archived: { type: "boolean" },
          ppuid: { type: "number" },
          comments: {
            type: "array",
            items: {
              type: "object",
              properties: {},
            },
          },
          latestVersion: {
            type: "object",
            properties: {
              id: { type: "number" },
              account_id: { type: "number" },
              priority: { type: "string" },
              status: { type: "string" },
              description: { type: "string" },
              created_at: { type: "string" },
              rationale: { type: "string" },
              authorName: { type: "string" },
              authorEmail: { type: "string" },
              authorImageName: { type: "string" },
              authorPlaceholderImage: { type: "string" },
            },
          },
          previousVersion: {
            type: "object",
            properties: {
              id: { type: "number" },
              account_id: { type: "number" },
              priority: { type: "string" },
              status: { type: "string" },
              description: { type: "string" },
              created_at: { type: "string" },
              rationale: { type: "string" },
            },
          },
        },
      },
    },
  };
  fastify.get(
    "/requirements/:requirementId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getRequirementSchema,
    },
    async function (request, reply) {
      const versions = await fastify.knex
        .from("reqversion")
        .select(
          "reqversion.*",
          "account.name as authorName",
          "account.email as authorEmail",
          "account.imageName as authorImageName",
          "account.placeholderImage as authorPlaceholderImage"
        )
        .where({
          requirement_id: request.params.requirementId,
        })
        .join("account", "account.id", "=", "reqversion.account_id")
        .orderBy("created_at", "desc")
        .limit(2);

      const latestVersion = versions[0];

      const previousVersion = versions.length === 2 ? versions[1] : {};

      const requirement = await fastify.knex
        .from("requirement")
        .join("reqgroup", "reqgroup.id", "=", "requirement.reqgroup_id")
        .join("per_project_unique_id", "per_project_unique_id.id", "requirement.ppuid_id")
        .leftJoin("requirement as parent", "parent.id", "=", "requirement.parent_requirement_id")
        .leftJoin("per_project_unique_id as p_ppuid", "p_ppuid.id", "parent.ppuid_id")
        .join("per_project_unique_id as rg_ppuid", "rg_ppuid.id", "reqgroup.ppuid_id")
        .select("requirement.*",
          "per_project_unique_id.readable_id as ppuid",
          "reqgroup.name as reqgroupName",
          "p_ppuid.readable_id as parent_ppuid",
          "rg_ppuid.readable_id as reqgroup_ppuid",
        )
        .where({
          "requirement.id": request.params.requirementId,
        })
        .first();

      return { ...requirement, latestVersion, previousVersion, comments: [] };
    }
  );

  const deleteRequirementSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
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
    "/requirements/:requirementId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: deleteRequirementSchema,
    },
    async function (request, reply) {
      await fastify
        .knex("requirement")
        .where("id", request.params.requirementId)
        .del();
      return ["success"];
    }
  );

  const patchRequirementSchema = {
    body: {
      type: "object",
      properties: {
        is_archived: { type: "boolean" },
        reqgroup_id: { type: "number" },
        project_id: { type: "number" },
        parent_requirement_id: { type: ["string", "null"] }
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        requirementId: { type: "number" },
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
    },
  };
  fastify.patch(
    "/requirements/:requirementId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: patchRequirementSchema,
    },
    async function (request, reply) {
      const { project_id, reqgroup_id, is_archived, parent_requirement_id } = request.body;
      const requirement_reqgroup_id = (await fastify
        .knex("requirement")
        .where("id", request.params.requirementId)
        .update({
          project_id,
          reqgroup_id,
          is_archived,
          parent_requirement_id: parent_requirement_id && fastify.deobfuscateId(parent_requirement_id)
        })
        .returning("reqgroup_id"))[0];

      await fastify
        .knex("reqgroup")
        .where("id", requirement_reqgroup_id)
        .update({
          updated_at: new Date(Date.now()),
          updated_by: request.user.id
        });

      return ["success"];
    }
  );

  const postReqVersionSchema = {
    body: {
      type: "object",
      properties: {
        priority: { type: "string" },
        status: { type: "string" },
        description: { type: "string" },
        rationale: { type: "string" },
      }
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
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
        type: "number",
      },
    },
  };
  fastify.post(
    "/requirements/:requirementId/versions",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postReqVersionSchema,
    },
    async function (request, reply) {
      const { description, priority, status, rationale } = request.body;
      const { requirementId: requirement_id } = request.params;

      const { slackAccessToken: token, ...latestVersion } = await fastify
        .knex.from("reqversion")
        .join("requirement", "requirement.id", "reqversion.requirement_id")
        .join("project", "project.id", "requirement.project_id")
        .join("team", "team.id", "project.team_id")
        .select("reqversion.description", "reqversion.priority", "reqversion.status", "reqversion.requirement_id", "slackAccessToken")
        .where({
          requirement_id: request.params.requirementId, // TODO: exclude status: proposed
        })
        .orderBy("reqversion.created_at", "desc")
        .first();

      let slackMessageTs;
      if (token) {
        const channel = (await fastify.slack.conversations.list({ token })).channels.find(x => x.name === "random").id; // TODO: take channel name for each project
        await fastify.slack.conversations.join({ channel, token });
        slackMessageTs = (await fastify.slack.chat.postMessage({
          text: `${request.user.name} ${status === "proposed" ? "proposed" : "made"} a new requirement version:\n*Description*:\n>${description}\n*Priority*:\n>${priority}\n*Rationale*:\n>${rationale || "_No rationale_"}\nReply to this thread to give feedback.`,
          token,
          channel,
          username: request.user.name,
          icon_url: request.user.imageName && `https://storage.googleapis.com/user-file-storage/${request.user.imageName}`
        })).ts;
      }

      const newVersion = {
        ...latestVersion,
        account_id: request.user.id,
        ...(priority && { priority }), // Only update priority if defined
        ...(description && { description }),
        ...(status && { status }),
        rationale,
        requirement_id,
        slackMessageTs
      };

      await fastify.knex("reqversion").insert(newVersion).returning("id");

      return requirement_id;
    }
  );

  const getRequirementVersionsSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
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
    response: {},
  };
  fastify.get(
    "/requirements/:requirementId/versions",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getRequirementVersionsSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("reqversion")
        .select(
          "reqversion.*",
          "account.name as authorName",
          "account.email as authorEmail",
          "account.imageName as authorImageName",
          "account.placeholderImage as authorPlaceholderImage"
        )
        .select(fastify.knex.raw('lag(reqversion.priority) over (order by reqversion.created_at) as previous_priority'))
        .select(fastify.knex.raw('lag(reqversion.status) over (order by reqversion.created_at) as previous_status'))
        .select(fastify.knex.raw('lag(reqversion.description) over (order by reqversion.created_at) as previous_description'))
        .where({
          requirement_id: request.params.requirementId,
        })
        .join("account", "account.id", "=", "reqversion.account_id")
        .orderBy("created_at", "desc");
    });

  const getRequirementFilesSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
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
    response: {},
  };
  fastify.get(
    "/requirements/:requirementId/files",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getRequirementFilesSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("file")
        .select("file.*", "per_project_unique_id.readable_id as ppuid")
        .join("per_project_unique_id", "per_project_unique_id.id", "file.ppuid_id")
        .join("file_requirement", "file.id", "file_requirement.file_id")
        .where({ "file_requirement.requirement_id": request.params.requirementId })
        .orderBy("ppuid", "asc");
    });

  const postRequirementFileSchema = {
    body: {
      type: "object",
      properties: {
        file_id: { type: ["number", "string"] }
      }
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        requirementId: { type: "number" },
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
    "/requirements/:requirementId/files",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postRequirementFileSchema,
    },
    async function (request, reply) {
      const { file_id } = request.body;
      const { requirementId } = request.params;

      return await fastify
        .knex("file_requirement")
        .insert({
          file_id: fastify.deobfuscateId(file_id),
          requirement_id: requirementId
        })
        .returning("id");
    }
  );

  const getRequirementUserclassesSchema = {
    body: {},
    queryString: {},
    params: {
      type: "object",
      properties: {
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
    response: {},
  };
  fastify.get(
    "/requirements/:requirementId/userclasses",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getRequirementUserclassesSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("userclass")
        .select("userclass.*", "per_project_unique_id.readable_id as ppuid")
        .join("per_project_unique_id", "per_project_unique_id.id", "userclass.ppuid_id")
        .join("requirement_userclass", "userclass.id", "requirement_userclass.userclass_id")
        .where({ "requirement_userclass.requirement_id": request.params.requirementId })
        .orderBy("ppuid", "asc");
    });

  const postRequirementUserclassSchema = {
    body: {
      type: "object",
      properties: {
        userclass_id: { type: ["number", "string"] }
      }
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        requirementId: { type: "number" },
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
    "/requirements/:requirementId/userclasses",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postRequirementUserclassSchema,
    },
    async function (request, reply) {
      const { userclass_id } = request.body;
      const { requirementId } = request.params;

      return await fastify
        .knex("requirement_userclass")
        .insert({
          userclass_id: fastify.deobfuscateId(userclass_id),
          requirement_id: requirementId
        })
        .returning("id");
    }
  );
};
