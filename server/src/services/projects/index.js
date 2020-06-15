module.exports = async function (fastify, opts) {
  const { Storage } = require('@google-cloud/storage');
  const { v4: uuidv4 } = require('uuid');
  const storage = new Storage();

  const getProjectSchema = {
    body: {},
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
        },
      },
    },
  };
  fastify.get(
    "/projects/:projectId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getProjectSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("project")
        .select("name", "team_id")
        .where("id", request.params.projectId)
        .first();
    }
  );

  const deleteProjectSchema = {
    body: {},
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
    "/projects/:projectId",
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
    body: {},
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
            isPrioritized: { type: "boolean" }
          },
        },
      },
    },
  };
  fastify.get(
    "/projects/:projectId/reqgroups",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getProjectReqgroupsSchema,
    },
    async function (request, reply) {
      const { type } = request.query;
      return await fastify.knex
        .from("reqgroup")
        .select("reqgroup.*", "per_project_unique_id.readable_id as ppuid")
        .join("per_project_unique_id", "per_project_unique_id.id", "reqgroup.ppuid_id")
        .where({ "reqgroup.project_id": request.params.projectId, type })
        .orderBy("ppuid", "asc");
    }
  );

  const getProjectFilesSchema = {
    body: {},
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
    "/projects/:projectId/files",
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

  const getArchivedSchema = {
    body: {},
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
            reqgroup_id: { type: "number" },
            project_id: { type: "number" },
            ppuid: { type: "number" },
            is_archived: { type: "boolean" },
          },
        },
      },
    },
  };
  fastify.get(
    "/projects/:projectId/archived",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getArchivedSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("requirement")
        .select("*")
        .where({ is_archived: true, project_id: request.params.projectId });
    }
  );

  const capitalizeFirstLetter = str => str.charAt(0).toUpperCase() + str.slice(1);

  const postReqgroupSchema = {
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
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
    "/projects/:projectId/reqgroups",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postReqgroupSchema,
    },
    async function (request, reply) {
      const { name, type } = request.body;
      const { projectId: project_id } = request.params;
      const maxPpuid =
        (
          await fastify
            .knex("per_project_unique_id")
            .where({ project_id })
            .max("readable_id")
            .first()
        ).max || 0;

      await fastify.knex("project").where({ id: project_id }).update({ reqgroups_updated_at: new Date(Date.now()) });

      const ppuid_id = (await fastify
        .knex("per_project_unique_id")
        .insert({
          project_id,
          readable_id: maxPpuid + 1
        })
        .returning("id"))[0];

      return await fastify
        .knex("reqgroup")
        .insert({
          project_id,
          name: capitalizeFirstLetter(name),
          type,
          ppuid_id,
          created_by: request.user.id,
          updated_by: request.user.id,
        })
        .returning("id");
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
    "/projects/:projectId/files",
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

      if (fileName) {
        const uploadedFileName = `${uuidv4()}-${fileName.replace(/[^a-zA-Z0-9_. -]/g, '')}`; // remove illegal characters
        const data = Buffer.from(file.replace(/^data:.*\/.*;base64,/, ''), 'base64');
        const gcloudFile = await storage.bucket('user-file-storage').file(uploadedFileName);
        await gcloudFile.save(data);
        await gcloudFile.makePublic();

        return await fastify
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
        return await fastify
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
        return await fastify
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
    }
  );

  const getProjectStakeholderGroupsSchema = {
    body: {},
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
    "/projects/:projectId/stakeholders",
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
    "/projects/:projectId/stakeholders",
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

      return await fastify
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
    }
  );

  const getProjectUserclassesSchema = {
    body: {},
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
    "/projects/:projectId/userclasses",
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
    "/projects/:projectId/userclasses",
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

      return await fastify
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
    }
  );
};
