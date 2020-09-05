module.exports = async function (fastify, opts) {
  const { Storage } = require('@google-cloud/storage');
  const { v4: uuidv4 } = require('uuid');
  const storage = new Storage();

  const getFileSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        fileId: { type: "number" },
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
    "/:fileId",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getFileSchema,
    },
    async function (request, reply) {
      const file = await fastify.knex
        .from("file")
        .select("file.*", "per_project_unique_id.readable_id as ppuid")
        .join("per_project_unique_id", "per_project_unique_id.id", "file.ppuid_id")
        .where({
          "file.id": request.params.fileId,
        })
        .first();
      const latestReview = await fastify.getLatestReview("reqgroup", request.params.fileId);
      return { ...file, latestReview };
    }
  );

  const putFileSchema = {
    body: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        svg: { type: "string" },
        is_draft: { type: "boolean" },
        file: { type: "string" },
        fileName: { type: "string" },
      }
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        fileId: { type: "number" },
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
    "/:fileId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: putFileSchema,
    },
    async function (request, reply) {
      const { name, description, svg, is_draft, file, fileName } = request.body;
      const currentFile = await fastify.knex
        .from("file")
        .select("*")
        .where({
          id: request.params.fileId,
        })
        .first();
      let id;
      if (currentFile.type === "upload") {
        let uploadedFileName;
        if (file) {
          const data = Buffer.from(file.replace(/^data:.*\/.*;base64,/, ''), 'base64');
          uploadedFileName = `${uuidv4()}-${fileName.replace(/[^a-zA-Z0-9_. -]/g, '')}`; // remove illegal characters
          const gcloudFile = await storage.bucket('user-file-storage').file(uploadedFileName);
          await gcloudFile.save(data);
          await gcloudFile.makePublic();
          try {
            await storage.bucket('user-file-storage').file(currentFile.fileName).delete();
          }
          catch (e) {
            console.error(e);
          }
        }

        ([id] = await fastify
          .knex("file")
          .where("id", request.params.fileId)
          .update({
            name,
            description,
            updated_at: new Date(Date.now()),
            updated_by: request.user.id,
            fileName: uploadedFileName,
            is_draft
          })
          .returning("id"));
      }
      else {
        ([id] = await fastify
          .knex("file")
          .where("id", request.params.fileId)
          .update({
            name,
            description,
            svg,
            is_draft,
            updated_at: new Date(Date.now()),
            updated_by: request.user.id,
          })
          .returning("id"));
      }
      await fastify.updateReviews("file", id);
      return [id];
    }
  );

  const deleteFileSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        fileId: { type: "number" },
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
    "/:fileId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: deleteFileSchema,
    },
    async function (request, reply) {
      const file = await fastify.knex
        .from("file")
        .select("*")
        .where({
          id: request.params.fileId,
        })
        .first();

      if (file.type === "upload") {
        try {
          await storage.bucket('user-file-storage').file(file.fileName).delete();
        }
        catch (e) {
          console.error(e);
        }
      }

      await fastify
        .knex("file")
        .where("id", request.params.fileId)
        .del();
      return ["success"];
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
  const getFileRequirementsSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        fileId: { type: "number" },
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
    "/:fileId/requirements",
    {
      preValidation: [fastify.authenticate, fastify.hasProjectAccess],
      schema: getFileRequirementsSchema,
    },
    async function (request, reply) {
      const selectColumns = [
        "requirement.id",
        "requirement.ppuid_id",
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
        "updater.name as updaterName"
      ];
      return await fastify.knex
        .from("requirement")
        .select(...selectColumns) // id overwrite must be at end
        .join("reqversion", getReqversion)
        .join("account", "account.id", "reqversion.account_id")
        .join("account as updater", "updater.id", "reqversion.updated_by")
        .join("per_project_unique_id", "per_project_unique_id.id", "requirement.ppuid_id")
        .join("file_requirement", "requirement.id", "file_requirement.requirement_id")
        .where({ "file_requirement.file_id": request.params.fileId })
        .orderByRaw("coalesce(reqversion.updated_at,reqversion.created_at) desc");
    }
  );

  const deleteFileRequirementSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        fileId: { type: "number" },
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
    "/:fileId/requirements/:requirementId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: deleteFileRequirementSchema,
    },
    async function (request, reply) {
      await fastify
        .knex("file_requirement")
        .where({
          "file_id": request.params.fileId,
          "requirement_id": request.params.requirementId,
        }).del();
      return ["success"];
    }
  );
};
