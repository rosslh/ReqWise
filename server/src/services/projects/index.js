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
          slackChannelName: { type: "string" }
        },
      },
    },
  };
  fastify.get(
    "/:projectId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getProjectSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("project")
        .select("name", "team_id", "slackChannelName")
        .where("id", request.params.projectId)
        .first();
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
            updated_at: { type: "string" },
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
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getProjectReqgroupsSchema,
    },
    async function (request, reply) {
      const { type } = request.query;

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
        "reqversion.id as reqversion_id",
        "reqversion.account_id",
        "reqversion.priority",
        "reqversion.status",
        "reqversion.description",
        "reqversion.created_at",
        "reqversion.updated_at",
        "per_project_unique_id.readable_id as ppuid",
        "account.name as authorName",
        "updater.name as updaterName",
      ];

      const reqgroups = await fastify.knex
        .from("reqgroup")
        .select("reqgroup.*", "per_project_unique_id.readable_id as ppuid")
        .join("per_project_unique_id", "per_project_unique_id.id", "reqgroup.ppuid_id")
        .where({ "reqgroup.project_id": request.params.projectId, type })
        .orderBy("ppuid", "asc");

      return await Promise.all(reqgroups.map(async (g) => {
        const requirements = await fastify.knex.withRecursive('ancestors', (qb) => {
          qb.select(...selectColumns, fastify.knex.raw("0 as depth"), fastify.knex.raw("LPAD(per_project_unique_id.readable_id::text, 5, '0') as hierarchical_id")).from('requirement')
            .where('requirement.parent_requirement_id', null)
            .andWhere("reqgroup_id", g.id)
            .join("reqversion", getReqversion)
            .join("account", "account.id", "reqversion.account_id")
            .join("account as updater", "updater.id", "reqversion.updated_by")
            .join("per_project_unique_id", "per_project_unique_id.id", "requirement.ppuid_id")
            .union((qb) => {
              qb.select(...selectColumns, fastify.knex.raw("ancestors.depth + 1"), fastify.knex.raw("concat(ancestors.hierarchical_id, '-', LPAD(per_project_unique_id.readable_id::text, 5, '0')) as hierarchical_id")).from('requirement')
                .join("per_project_unique_id", "per_project_unique_id.id", "requirement.ppuid_id")
                .join('ancestors', 'ancestors.id', 'requirement.parent_requirement_id').join("reqversion", getReqversion)
                .join("account", "account.id", "reqversion.account_id")
                .join("account as updater", "updater.id", "reqversion.updated_by")
            })
        }).select('*').from('ancestors').orderBy('hierarchical_id');
        return ({
          ...g,
          requirements
        });
      }));
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
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getProjectFilesSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("file")
        .select("file.*", "per_project_unique_id.readable_id as ppuid")
        .join("per_project_unique_id", "per_project_unique_id.id", "file.ppuid_id")
        .where({ "file.project_id": request.params.projectId })
        .orderBy("ppuid", "asc");
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
      const maxPpuid =
        (
          await fastify
            .knex("per_project_unique_id")
            .where({ project_id })
            .max("readable_id")
            .first()
        ).max || 0;

      const { slackAccessToken: token, id: projectId } = await fastify.knex
        .from("project")
        .select("team.*", "project.*")
        .join("team", "team.id", "project.team_id")
        .where("project.id", request.params.projectId)
        .first();

      await fastify.knex("project").where({ id: project_id }).update({ reqgroups_updated_at: new Date(Date.now()) });

      const ppuid_id = (await fastify
        .knex("per_project_unique_id")
        .insert({
          project_id,
          readable_id: maxPpuid + 1
        })
        .returning("id"))[0];

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
          text: `${request.user.name} made a new ${getReqgroupType(type)}: <https://reqwise.com/projects/${fastify.obfuscateId(projectId)}|#${maxPpuid + 1} - ${name}>.`,
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
      const { name, description, svg, file, fileName, url } = request.body;
      if (!(svg || fileName || url)) {
        reply.code(400).send("Missing svg or file or url");
      }
      const { projectId: project_id } = request.params;
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
      preValidation: [fastify.authenticate, fastify.isTeamMember],
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

  const postStakeholderGroupSchema = {
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        svg: { type: "string" },
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
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getProjectQuestionnairesSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("brainstormForm")
        .select("*", "brainstormForm.id as id")
        .leftJoin("brainstormPrompt", "brainstormForm.id", "brainstormPrompt.brainstormForm_id")
        .where({ "brainstormForm.project_id": request.params.projectId, "brainstormForm.is_draft": request.query.draft });
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
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getProjectUserclassesSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("userclass")
        .select("userclass.*", "per_project_unique_id.readable_id as ppuid")
        .join("per_project_unique_id", "per_project_unique_id.id", "userclass.ppuid_id")
        .where({ "userclass.project_id": request.params.projectId })
        .orderBy("ppuid", "asc");
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
      preValidation: [fastify.authenticate, fastify.isTeamMember],
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
      const { name, description, persona, importance } = request.body;
      const { projectId: project_id } = request.params;
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

      const [id] = await fastify
        .knex("userclass")
        .insert({
          project_id,
          name,
          description,
          persona,
          importance,
          ppuid_id,
          created_by: request.user.id,
          updated_by: request.user.id,
        })
        .returning("id");

      await fastify.createAlert("create", "userclass", name, id, project_id, request.user.id);
      return [id];
    }
  );
};
