const fp = require("fastify-plugin");
const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const storage = new Storage();

module.exports = fp(function (fastify, opts, done) {

  fastify.decorate("getBaselined", async function (projectId) {
    let reviews = await fastify.knex
      .from("stakeholderReview")
      .select("*")
      .where({ project_id: projectId, status: "accept" });
    // TODO: only get latest review for each entity

    reviews = Promise.all(reviews.map(async r => {
      if (r.entityType === "reqgroup") {
        const reqgroup = await fastify.getReqgroup(r.entity_reqgroup_id);
        return { ...r, reqgroup };
      } else if (r.entityType === "userclass") {
        const userclass = await fastify.knex
          .from("userclass")
          .select("*", "per_project_unique_id.readable_id as ppuid", "userclass.id as id")
          .join("per_project_unique_id", "per_project_unique_id.id", "userclass.ppuid_id")
          .where("userclass.id", r.entity_userclass_id)
          .first();
        const latestReview = await fastify.getLatestReview("userclass", userclass.id);
        return { ...r, userclass: { ...userclass, latestReview } };
      } else { // file
        const file = await fastify.knex
          .from("file")
          .select("*", "per_project_unique_id.readable_id as ppuid", "userclass.id as id")
          .join("per_project_unique_id", "per_project_unique_id.id", "file.ppuid_id")
          .where("file.id", r.entity_file_id)
          .first();
        const latestReview = await fastify.getLatestReview("file", file.id);
        return { ...r, file: { ...file, latestReview } };
      }
    }));

    return reviews;
  });

  fastify.decorate("createBaseline", async function (reviewId) {
    // get entity associated with review
    const review = await fastify.knex
      .from("stakeholderReview")
      .leftJoin("account", "account.id", "stakeholderReview.reviewedBy")
      .select("*", "account.name as reviewerName", "stakeholderReview.id as id")
      .where("stakeholderReview.id", reviewId).first();

    const entityId = review[`entity_${review.entityType}_id`];

    if (review.entityType === "reqgroup") {
      // duplicate reqgroup

      const data = {};
      const reqgroup = await fastify.getReqgroup(entityId);
      const properties = ["created_at", "created_by", "description", "isDeletable", "isMaxOneRequirement", "isPrioritized", "is_draft", "name", "ppuid_id", "project_id", "type", "updated_at", "updated_by"];
      properties.forEach(prop => data[prop] = reqgroup[prop]);
      data.stakeholderReview_id = reviewId;
      data.is_baseline = true;
      const [reqgroupId] = await fastify.knex("reqgroup").insert(data).returning("id");

      // duplicate requirements and reqversions

      const { project_id } = reqgroup;
      let requirementIdMapping = new Map(); // maps old ids to new ids

      await Promise.all(reqgroup.requirements.map(async requirement => {
        const reqData = {
          project_id,
          reqgroup_id: reqgroupId,
          ppuid_id: requirement.ppuid_id,
          parent_requirement_id: requirement.parent_requirement_id && fastify.deobfuscateId(requirement.parent_requirement_id),
        };

        const [requirement_id] = await fastify
          .knex("requirement")
          .insert(reqData)
          .returning("id");

        requirementIdMapping.set(fastify.deobfuscateId(requirement.id), requirement_id);

        const reqversions = await fastify.knex.from("reqversion").select("*").where({ requirement_id: requirement.id });
        await Promise.all(reqversions.map(async version => {
          await fastify
            .knex("reqversion")
            .insert({
              ...version,
              id: undefined,
              requirement_id
            })
            .returning("id");
        }))
      }));

      // fix requirement recursive references
      console.log("Fixing requirement recursive references");

      const requirements = await fastify.knex.from("requirement").select("*").where({ reqgroup_id: reqgroupId });

      await Promise.all(requirements.map(async requirement => {
        await fastify.knex("requirement").update({
          parent_requirement_id: requirement.parent_requirement_id && requirementIdMapping.get(fastify.deobfuscateId(requirement.parent_requirement_id))
        }).where({ id: requirement.id });
      }));
    }
    else if (review.entityType === "userclass") { // userclass
      const data = await fastify.knex.from("userclass")
        .select("*")
        .where("userclass.id", entityId)
        .first();
      delete data.id;
      data.stakeholderReview_id = reviewId;
      data.is_baseline = true;
      await fastify.knex("userclass").insert(data);
    }
    else if (review.entityType === "file") { // userclass
      const data = await fastify.knex.from("file")
        .select("*")
        .where("file.id", entityId)
        .first();
      if (data.type === "upload") {
        const newName = `${uuidv4()}-${data.fileName.slice(37)}`;
        const newFile = storage.bucket('user-file-storage').file(newName);
        await storage
          .bucket('user-file-storage')
          .file(data.fileName)
          .copy(newFile);
        await newFile.makePublic();
        data.fileName = newName;
      }
      delete data.id;
      data.stakeholderReview_id = reviewId;
      data.is_baseline = true;
      await fastify.knex("file").insert(data);
    }
  });

  done();
});
