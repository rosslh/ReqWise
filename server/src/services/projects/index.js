module.exports = async function (fastify, opts) {
  const { Storage } = require('@google-cloud/storage');
  const { v4: uuidv4 } = require('uuid');
  const storage = new Storage();

  const getProjectSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
          name: { type: "string" },
          team_id: { type: "number" },
          slackChannelName: { type: "string" },
          scopes: { type: "array", items: { type: "string" } }
        },
      },
    },
  };
  fastify.get(
    "/:projectId",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getProjectSchema,
    },
    async function (request, reply) {
      const project = await fastify.knex
        .from("project")
        .select("name", "team_id", "slackChannelName")
        .where("id", request.params.projectId)
        .first();
      const scopes = await fastify.getScopes(request.user.id, request.params.projectId);
      return { ...project, scopes };
    }
  );

  const putProjectSchema = {
    body: {
      type: "object",
      properties: {
        name: { type: "string" },
        slackChannelName: { type: "string" },
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
    "/:projectId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: putProjectSchema,
    },
    async function (request, reply) {
      let { name, slackChannelName } = request.body;
      slackChannelName = slackChannelName && slackChannelName.toLowerCase().replace(/[^a-z0-9_-]+/g, "").slice(0, 79);
      return (
        await fastify
          .knex("project")
          .update({ name, slackChannelName })
          .where("id", request.params.projectId)
          .returning(["name", "slackChannelName"])
      )[0];
    }
  );

  const deleteProjectSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
    "/:projectId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: { deleteProjectSchema },
    },
    async function (request, reply) {
      await fastify.knex("project").where("id", request.params.projectId).del();
      return ["success"];
    }
  );

  const getProjectReqgroupsSchema = {
    queryString: {
      type: "object",
      properties: {
        type: { type: "string" },
      },
    },
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
            updated_at: { type: "string" },
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
    },
  };
  fastify.get(
    "/:projectId/reqgroups",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getProjectReqgroupsSchema,
    },
    async function (request, reply) {
      const { type } = request.query;
      const reqgroups = await fastify.getReqgroups(request.params.projectId, type);
      const scopes = await fastify.getScopes(request.user.id, request.params.projectId);
      return reqgroups.filter(x => scopes.includes("member") || !x.is_draft);
    });

  const getProjectBaselinesSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
      },
    },
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" },
      },
      required: ["Authorization"],
    },
    response: {}
  };
  fastify.get(
    "/:projectId/baselines",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getProjectBaselinesSchema,
    },
    async function (request, reply) {
      return await fastify.getBaselined(request.params.projectId);
    });

  const getProjectFilesSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
    "/:projectId/files",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getProjectFilesSchema,
    },
    async function (request, reply) {
      let result = await fastify.knex
        .from("file")
        .select("file.*", "per_project_unique_id.readable_id as ppuid")
        .join("per_project_unique_id", "per_project_unique_id.id", "file.ppuid_id")
        .where({ "file.project_id": request.params.projectId })
        .orderBy("ppuid", "asc");

      result = await Promise.all(result.map(async file => {
        const latestReview = await fastify.getLatestReview("file", file.id);
        return {
          ...file,
          latestReview
        };
      }));

      const scopes = await fastify.getScopes(request.user.id, request.params.projectId);
      return result.filter(x => scopes.includes("member") || !x.is_draft);
    }
  );

  const capitalizeFirstLetter = str => str.charAt(0).toUpperCase() + str.slice(1);

  const getReqgroupType = type => {
    if (type === "quality") {
      return "quality attribute";
    } else if (type === "business") {
      return "business requirement group";
    } else {
      return type;
    }
  }

  const postReqgroupSchema = {
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
        isPrioritized: { type: "boolean" },
        is_draft: { type: "boolean" }
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
  fastify.post(
    "/:projectId/reqgroups",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postReqgroupSchema,
    },
    async function (request, reply) {
      const { name, type, isPrioritized } = request.body;
      const { projectId: project_id } = request.params;

      const { slackAccessToken: token, id: projectId } = await fastify.knex
        .from("project")
        .select("team.*", "project.*")
        .join("team", "team.id", "project.team_id")
        .where("project.id", request.params.projectId)
        .first();

      await fastify.knex("project").where({ id: project_id }).update({ reqgroups_updated_at: new Date(Date.now()) });

      const { id: ppuid_id, readable_id } = await fastify.getNewPpuid(project_id);

      const [id] = await fastify
        .knex("reqgroup")
        .insert({
          project_id,
          name: capitalizeFirstLetter(name),
          type,
          ppuid_id,
          created_by: request.user.id,
          updated_by: request.user.id,
          isPrioritized
        })
        .returning("id");

      if (token) {
        const channel = await fastify.slackGetChannelId(projectId);
        await fastify.slack.chat.postMessage({
          text: `${request.user.name} made a new ${getReqgroupType(type)}: <https://reqwise.com/projects/${fastify.obfuscateId(projectId)}|#${readable_id} - ${name}>.`,
          token,
          channel,
          username: request.user.name,
          icon_url: request.user.imageName && `https://storage.googleapis.com/user-file-storage/${request.user.imageName}`
        });
      }

      await fastify.createAlert("create", "reqgroup", name, id, project_id, request.user.id);

      return [id];
    }
  );
  const postFileSchema = {
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        svg: { type: "string" },
        is_draft: { type: "boolean" },
        file: { type: "string" },
        fileName: { type: "string" },
        url: { type: "string" },
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
  fastify.post(
    "/:projectId/files",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postFileSchema,
    },
    async function (request, reply) {
      const { name, description, svg, is_draft, file, fileName, url } = request.body;
      if (!(svg || fileName || url)) {
        reply.code(400).send("Missing svg or file or url");
      }
      const { projectId: project_id } = request.params;
      const { id: ppuid_id } = await fastify.getNewPpuid(project_id);

      let id;

      if (fileName) {
        const uploadedFileName = `${uuidv4()}-${fileName.replace(/[^a-zA-Z0-9_. -]/g, '')}`; // remove illegal characters
        const data = Buffer.from(file.replace(/^data:.*\/.*;base64,/, ''), 'base64');
        const gcloudFile = await storage.bucket('user-file-storage').file(uploadedFileName);
        await gcloudFile.save(data);
        await gcloudFile.makePublic();

        [id] = await fastify
          .knex("file")
          .insert({
            project_id,
            name,
            description,
            ppuid_id,
            created_by: request.user.id,
            updated_by: request.user.id,
            fileName: uploadedFileName,
            type: "upload"
          })
          .returning("id");
      }
      else if (url) {
        [id] = await fastify
          .knex("file")
          .insert({
            project_id,
            name,
            description,
            ppuid_id,
            created_by: request.user.id,
            updated_by: request.user.id,
            url,
            type: "externalResource"
          })
          .returning("id");
      }
      else {
        [id] = await fastify
          .knex("file")
          .insert({
            project_id,
            name,
            description,
            ppuid_id,
            created_by: request.user.id,
            updated_by: request.user.id,
            svg,
            is_draft,
            type: "diagram"
          })
          .returning("id");
      }
      await fastify.createAlert("create", "file", name, id, project_id, request.user.id);
      return [id];
    }
  );

  const getProjectStakeholderGroupsSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
    "/:projectId/stakeholders",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getProjectStakeholderGroupsSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("stakeholderGroup")
        .select("stakeholderGroup.*", "per_project_unique_id.readable_id as ppuid")
        .join("per_project_unique_id", "per_project_unique_id.id", "stakeholderGroup.ppuid_id")
        .where({ "stakeholderGroup.project_id": request.params.projectId })
        .orderBy("ppuid", "asc");
    }
  );

  const getProjectStakeholderUsersSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
    "/:projectId/external-stakeholders",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getProjectStakeholderUsersSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("stakeholder_project")
        .select("account.*", "stakeholder_project.id as id", "account.id as account_id")
        .join("account", "account.id", "stakeholder_project.account_id")
        .where("stakeholder_project.project_id", request.params.projectId);
    }
  );

  const postStakeholderGroupSchema = {
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
  fastify.post(
    "/:projectId/stakeholders",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postStakeholderGroupSchema,
    },
    async function (request, reply) {
      const { name, description } = request.body;
      const { projectId: project_id } = request.params;

      const { id: ppuid_id } = await fastify.getNewPpuid(project_id);

      const [id] = await fastify
        .knex("stakeholderGroup")
        .insert({
          project_id,
          name,
          description,
          ppuid_id,
          created_by: request.user.id,
          updated_by: request.user.id,
        })
        .returning("id");

      await fastify.createAlert("create", "stakeholderGroup", name, id, project_id, request.user.id);
      return [id];
    }
  );

  const postQuestionnaireSchema = {
    body: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string" }
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
  fastify.post(
    "/:projectId/questionnaires",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postQuestionnaireSchema,
    },
    async function (request, reply) {
      const { title } = request.body;
      const { projectId: project_id } = request.params;

      const [id] = await fastify
        .knex("brainstormForm")
        .insert({
          project_id,
          description: title,
          created_by: request.user.id
        })
        .returning("id");

      await fastify.createAlert("create", "questionnaire", title, id, project_id, request.user.id);
      return [fastify.obfuscateId(id)]; // used to redirect to questionnaire after creation
    }
  );

  const getProjectQuestionnairesSchema = {
    queryString: {
      type: "object",
      properties: {
        draft: { type: "boolean" }
      }
    },
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
    "/:projectId/questionnaires",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getProjectQuestionnairesSchema,
    },
    async function (request, reply) {
      let questionnaires = await fastify.knex
        .from("brainstormForm")
        .select("*", "brainstormForm.id as id")
        .where({ "brainstormForm.project_id": request.params.projectId, "brainstormForm.is_draft": request.query.draft });

      const result = await Promise.all(questionnaires.map(async q => {
        const numPrompts = (await fastify.knex.from("brainstormPrompt").select("*").where("brainstormForm_id", q.id)).length;
        const numResponses = (await fastify.knex.from("brainstormResponse").select("*").join("brainstormPrompt", "brainstormPrompt.id", "brainstormResponse.brainstormPrompt_id").where("brainstormForm_id", q.id)).length;
        return { ...q, numPrompts, numResponses };
      }));

      const scopes = await fastify.getScopes(request.user.id, request.params.projectId);
      return result.filter(x => scopes.includes("member") || !x.is_draft);
    }
  );

  const getProjectPromptsSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
    "/:projectId/prompts",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getProjectPromptsSchema,
    },
    async function (request, reply) {
      const prompts = await fastify.knex
        .from("brainstormPrompt")
        .select("*", "brainstormPrompt.id as id", "per_project_unique_id.readable_id as ppuid")
        .join("per_project_unique_id", "per_project_unique_id.id", "brainstormPrompt.ppuid_id")
        .join("brainstormForm", "brainstormForm.id", "brainstormPrompt.brainstormForm_id")
        .where({
          "brainstormForm.project_id": request.params.projectId
        })
        .orderBy("ppuid", "asc");
      return await Promise.all(prompts.map(p => fastify.getPromptDetails(p, request)));
    }
  );

  const getProjectUserclassesSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
    "/:projectId/userclasses",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getProjectUserclassesSchema,
    },
    async function (request, reply) {
      let result = await fastify.knex
        .from("userclass")
        .select("userclass.*", "per_project_unique_id.readable_id as ppuid")
        .join("per_project_unique_id", "per_project_unique_id.id", "userclass.ppuid_id")
        .where({ "userclass.project_id": request.params.projectId })
        .orderBy("ppuid", "asc");

      result = await Promise.all(result.map(async userclass => {
        const latestReview = await fastify.getLatestReview("userclass", userclass.id);
        return { ...userclass, latestReview };
      }));

      const scopes = await fastify.getScopes(request.user.id, request.params.projectId);
      return result.filter(x => scopes.includes("member") || !x.is_draft);
    }
  );

  const getProjectActivitySchema = {
    queryString: {
      type: "object",
      properties: {
        page: { type: "number" }
      }
    }, params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
    "/:projectId/activity",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getProjectActivitySchema,
    },
    async function (request, reply) {
      const limit = 15;
      const offset = limit * (request.query.page || 0);
      return await fastify.knex
        .from("alert")
        .limit(limit)
        .offset(offset)
        .select("alert.*", "team.name as teamName", "project.name as projectName", "project.team_id as team_id", "account.name as authorName", "account.imageName as authorImageName", "alert.id as id")
        .join("account", "alert.created_by", "account.id")
        .join("project", "project.id", "alert.project_id")
        .join("team", "team.id", "project.team_id")
        .where({ "alert.project_id": request.params.projectId })
        .orderBy("created_at", "desc");
    }
  );

  const postUserclassSchema = {
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        persona: { type: "string" },
        importance: { type: "string" },
        is_draft: { type: "boolean" },
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
  fastify.post(
    "/:projectId/userclasses",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postUserclassSchema,
    },
    async function (request, reply) {
      const { name, description, persona, importance, is_draft } = request.body;
      const { projectId: project_id } = request.params;
      const { id: ppuid_id } = await fastify.getNewPpuid(project_id);

      const [id] = await fastify
        .knex("userclass")
        .insert({
          project_id,
          name,
          description,
          persona,
          importance,
          is_draft,
          ppuid_id,
          created_by: request.user.id,
          updated_by: request.user.id,
        })
        .returning("id");

      await fastify.createAlert("create", "userclass", name, id, project_id, request.user.id);
      return [id];
    }
  );

  const getProjectInvitesSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
            name: { type: "string" }
          },
          required: ["inviteeEmail", "id"],
        },
      },
    },
  };
  fastify.get(
    "/:projectId/invites",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getProjectInvitesSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("stakeholderInvite")
        .select("*", "stakeholderInvite.id as id")
        .leftJoin("stakeholderGroup", "stakeholderGroup.id", "stakeholderInvite.stakeholderGroup_id")
        .where("stakeholderInvite.project_id", request.params.projectId);
    }
  );

  const postTeamInviteSchema = {
    body: {
      type: "object",
      required: ["inviteeEmail"],
      properties: {
        inviteeEmail: { type: "string" },
        stakeholderGroup_id: { type: ["string", "number"] },
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
    "/:projectId/invites",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: postTeamInviteSchema,
    },
    async function (request, reply) {
      let { inviteeEmail, stakeholderGroup_id } = request.body;
      stakeholderGroup_id = fastify.deobfuscateId(stakeholderGroup_id);

      const memberAlreadyExists = (
        await fastify.knex
          .from("account")
          .select("account.id")
          .where({
            email: inviteeEmail,
            "stakeholder_project.project_id": request.params.projectId,
          })
          .join("stakeholder_project", "stakeholder_project.account_id", "account.id")
      ).length;

      if (memberAlreadyExists) {
        reply.code(409);
        return ["Member already exists"];
      }

      const inviteAlreadyExists = (
        await fastify.knex.from("stakeholderInvite").select("id").where({
          inviteeEmail,
          project_id: request.params.projectId,
        })
      ).length;

      if (inviteAlreadyExists) {
        reply.code(409);
        return ["Invite already exists"];
      }

      await fastify
        .knex("stakeholderInvite")
        .insert({
          inviteeEmail,
          stakeholderGroup_id,
          inviter_id: request.user.id,
          project_id: request.params.projectId,
        })
        .returning("id");

      return ["success"];
    }
  );

  const deleteInviteSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
    "/:projectId/invites/:inviteId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: deleteInviteSchema,
    },
    async function (request, reply) {
      await fastify
        .knex("stakeholderInvite")
        .where({ project_id: request.params.projectId, id: request.params.inviteId })
        .del();
      return ["success"];
    }
  );

  const getStakeholderReviewsSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        projectId: { type: "number" },
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
    "/:projectId/reviews",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getStakeholderReviewsSchema,
    },
    async function (request, reply) {
      let reviews = await fastify.knex
        .from("stakeholderReview")
        .leftJoin("account", "account.id", "stakeholderReview.reviewedBy")
        .select("*", "account.name as reviewerName", "stakeholderReview.id as id")
        .where("stakeholderReview.project_id", request.params.projectId);

      reviews = await Promise.all(reviews.map(async review => {
        const responses = await fastify.knex
          .from("comment")
          .select(
            "comment.*",
            "account.name as authorName",
            "account.email as authorEmail",
            "account.imageName as authorImageName",
            "account.placeholderImage as authorPlaceholderImage"
          )
          .join("account", "account.id", "=", "comment.account_id")
          .where("comment.stakeholderReview_id", review.id);
        const reviewedEntity = await fastify.getReviewedEntity(review.id);
        const stakeholders = await fastify.getReviewStakeholders(review.id);
        return { ...review, responses, reviewedEntity, stakeholders };
      }));
      return reviews;
    }
  );
};
