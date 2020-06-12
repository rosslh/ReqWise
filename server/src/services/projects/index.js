module.exports = async function (fastify, opts) {
  const { Storage } = require('@google-cloud/storage');
  const { v4: uuidv4 } = require('uuid');
  var fs = require('fs');
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

  const getProjectModelsSchema = {
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
    "/projects/:projectId/models",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getProjectModelsSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("model")
        .select("model.*", "per_project_unique_id.readable_id as ppuid")
        .join("per_project_unique_id", "per_project_unique_id.id", "model.ppuid_id")
        .where({ "model.project_id": request.params.projectId })
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
  const postModelSchema = {
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        svg: { type: "string" },
        file: { type: "string" },
        fileName: { type: "string" }
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
    "/projects/:projectId/models",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postModelSchema,
    },
    async function (request, reply) {
      const { name, description, svg, file, fileName } = request.body;
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

      if (file) {
        const uploadedFileName = `${uuidv4()}-${fileName}`;
        let data = Buffer.from(file.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');
        fs.writeFileSync(uploadedFileName, data);

        await storage.bucket('user-file-storage').upload(uploadedFileName, {
          gzip: true,
          metadata: {
            cacheControl: 'no-cache',
          },
        });

        fs.unlinkSync(uploadedFileName);

        return await fastify
          .knex("model")
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
      else {
        return await fastify
          .knex("model")
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
};
