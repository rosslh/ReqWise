"use-strict";

const fp = require("fastify-plugin");

module.exports = fp(async function (fastify, opts) {
  fastify.register(require("fastify-jwt"), {
    secret: process.env.JWT_KEY,
  });

  fastify.decorate("authenticate", async function (request, reply) {
    const jwtContent = await request.jwtVerify();
    const account = await fastify.knex
      .from("account")
      .select("id", "imageName")
      .where("email", jwtContent.email && jwtContent.email.toLowerCase())
      .first();
    if (jwtContent.id === account.id) {
      request.user = { ...jwtContent, imageName: account.imageName };
    } else {
      throw new Error("Email and ID do not match");
    }
  });

  const getFormId = async ({ questionnaireId, promptId, responseId, reactionId }) => {
    if (questionnaireId) {
      return { brainstormForm_id: questionnaireId };
    } else if (promptId) {
      return await fastify.knex.from("brainstormPrompt").select("brainstormForm_id").where({ id: promptId }).first();
    } else if (responseId) {
      return await fastify.knex
        .from("brainstormResponse")
        .select("brainstormPrompt.brainstormForm_id")
        .join("brainstormPrompt", "brainstormResponse.brainstormPrompt_id", "brainstormPrompt.id")
        .where("brainstormResponse.id", responseId).first();
    } else if (reactionId) {
      return await fastify.knex
        .from("brainstormReaction")
        .select("brainstormPrompt.brainstormForm_id")
        .join("brainstormResponse", "brainstormReaction.brainstormResponse_id", "brainstormResponse.id")
        .join("brainstormPrompt", "brainstormResponse.brainstormPrompt_id", "brainstormPrompt.id")
        .where("brainstormReaction.id", reactionId).first();
    } else {
      throw new Error("Could not authenticate using URL parameters");
    }
  };

  const hasBrainstormInvite = async (request, reply, formId) => {
    const { email } = request.user;
    const invites = await fastify.knex.from("brainstormInvite").select("*").where("brainstormForm_id", formId);
    if (!invites.some(i => i.inviteeEmail.toLowerCase() === email.toLowerCase())) {
      throw new Error("Missing brainstorm invite");
    }
  };

  fastify.decorate("allowAnonIfPublic", async function (request, reply) {
    const { brainstormForm_id: formId } = await getFormId(request.params);
    const { is_public: isPublic } = await fastify.knex.from("brainstormForm").select("is_public").where({ id: formId }).first();

    const verify = async () => {
      const jwtContent = await request.jwtVerify();
      const account = await fastify.knex
        .from("account")
        .select("*")
        .where("email", jwtContent.email && jwtContent.email.toLowerCase())
        .first();
      if (jwtContent.id === account.id) {
        request.user = { ...jwtContent, imageName: account.imageName, name: account.name, email: account.email && account.email.toLowerCase() };
      } else {
        throw new Error("Email and ID do not match");
      }
    };

    if (isPublic) {
      try {
        await verify();
      } catch (e) {
        request.isAnonymous = true;
      }
    } else {
      await verify();
      try {
        await authenticateRoute(request, reply, false, true);
      }
      catch (e) {
        try {
          await hasBrainstormInvite(request, reply, formId);
        } catch (e) {
          reply.code(403);
          reply.send("Questionnaire access denied");
        }
      }
    }
  });

  const isTeamMemberByTeamId = async (request, reply, isAdmin = false) => {
    const membership = (
      await fastify.knex
        .from("account_team")
        .select("id")
        .where({
          team_id: request.params.teamId,
          account_id: request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!membership) {
      throw new Error(`Not a team ${isAdmin ? "admin" : "member"}`);
    }
  };

  const isTeamMemberByProjectId = async (request, reply, isAdmin = false) => {
    const membership = (
      await fastify.knex
        .from("project")
        .join("account_team", "account_team.team_id", "project.team_id")
        .select("account_team.id")
        .where({
          "project.id": request.params.projectId,
          "account_team.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!membership) {
      throw new Error(`Not a team ${isAdmin ? "admin" : "member"}`);
    }
  };

  const isProjectStakeholderByProjectId = async (request, reply) => {
    const association = (
      await fastify.knex
        .from("project")
        .join("stakeholder_project", "stakeholder_project.project_id", "project.id")
        .select("stakeholder_project.id")
        .where({
          "project.id": request.params.projectId,
          "stakeholder_project.account_id": request.user.id
        })
    ).length;

    if (!association) {
      throw new Error(`Not a project stakeholder`);
    }
  };

  const isTeamMemberByTemplateId = async (request, reply, isAdmin = false) => {
    const membership = (
      await fastify.knex
        .from("projectTemplate")
        .join("account_team", "account_team.team_id", "projectTemplate.team_id")
        .select("account_team.id")
        .where({
          "projectTemplate.id": request.params.templateId,
          "account_team.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!membership) {
      throw new Error(`Not a team ${isAdmin ? "admin" : "member"}`);
    }
  };

  const isTeamMemberByStakeholderGroupId = async (request, reply, isAdmin = false) => {
    const membership = (
      await fastify.knex
        .from("stakeholderGroup")
        .join("project", "project.id", "stakeholderGroup.project_id")
        .join("account_team", "account_team.team_id", "project.team_id")
        .select("account_team.id")
        .where({
          "stakeholderGroup.id": request.params.stakeholderGroupId,
          "account_team.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!membership) {
      throw new Error(`Not a team ${isAdmin ? "admin" : "member"}`);
    }
  };

  const isProjectStakeholderByStakeholderGroupId = async (request, reply) => {
    const association = (
      await fastify.knex
        .from("stakeholderGroup")
        .join("project", "project.id", "stakeholderGroup.project_id")
        .join("stakeholder_project", "stakeholder_project.project_id", "project.id")
        .select("stakeholder_project.id")
        .where({
          "stakeholderGroup.id": request.params.stakeholderGroupId,
          "stakeholder_project.account_id": request.user.id
        })
    ).length;

    if (!association) {
      throw new Error(`Not a project stakeholder`);
    }
  };

  const isTeamMemberByUserclassId = async (request, reply, isAdmin = false) => {
    const membership = (
      await fastify.knex
        .from("userclass")
        .join("project", "project.id", "userclass.project_id")
        .join("account_team", "account_team.team_id", "project.team_id")
        .select("account_team.id")
        .where({
          "userclass.id": request.params.userclassId,
          "account_team.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!membership) {
      throw new Error(`Not a team ${isAdmin ? "admin" : "member"}`);
    }
  };

  const isProjectStakeholderByUserclassId = async (request, reply) => {
    const association = (
      await fastify.knex
        .from("userclass")
        .join("project", "project.id", "userclass.project_id")
        .join("stakeholder_project", "stakeholder_project.project_id", "project.id")
        .select("stakeholder_project.id")
        .where({
          "userclass.id": request.params.userclassId,
          "stakeholder_project.account_id": request.user.id
        })
    ).length;

    if (!association) {
      throw new Error(`Not a project stakeholder`);
    }
  };

  const isTeamMemberByFileId = async (request, reply, isAdmin = false) => {
    const membership = (
      await fastify.knex
        .from("file")
        .join("project", "project.id", "file.project_id")
        .join("account_team", "account_team.team_id", "project.team_id")
        .select("account_team.id")
        .where({
          "file.id": request.params.fileId,
          "account_team.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!membership) {
      throw new Error(`Not a team ${isAdmin ? "admin" : "member"}`);
    }
  };

  const isProjectStakeholderByFileId = async (
    request,
    reply,
    isAdmin = false
  ) => {
    const stakeholdership = (
      await fastify.knex
        .from("file")
        .join("stakeholder_project", "stakeholder_project.project_id", "file.project_id")
        .select("stakeholder_project.id")
        .where({
          "file.id": request.params.fileId,
          "stakeholder_project.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!stakeholdership) {
      throw new Error(`Not a stakeholder`);
    }
  };

  const isTeamMemberByReqgroupId = async (request, reply, isAdmin = false) => {
    const membership = (
      await fastify.knex
        .from("reqgroup")
        .join("project", "project.id", "reqgroup.project_id")
        .join("account_team", "account_team.team_id", "project.team_id")
        .select("account_team.id")
        .where({
          "reqgroup.id": request.params.reqgroupId,
          "account_team.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!membership) {
      throw new Error(`Not a team ${isAdmin ? "admin" : "member"}`);
    }
  };

  const isProjectStakeholderByReqgroupId = async (
    request,
    reply,
    isAdmin = false
  ) => {
    const stakeholdership = (
      await fastify.knex
        .from("reqgroup")
        .join("stakeholder_project", "stakeholder_project.project_id", "reqgroup.project_id")
        .select("stakeholder_project.id")
        .where({
          "reqgroup.id": request.params.reqgroupId,
          "stakeholder_project.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!stakeholdership) {
      throw new Error(`Not a stakeholder`);
    }
  };

  const isTeamMemberByRequirementId = async (
    request,
    reply,
    isAdmin = false
  ) => {
    const membership = (
      await fastify.knex
        .from("requirement")
        .join("reqgroup", "reqgroup.id", "requirement.reqgroup_id")
        .join("project", "project.id", "reqgroup.project_id")
        .join("account_team", "account_team.team_id", "project.team_id")
        .select("account_team.id")
        .where({
          "requirement.id": request.params.requirementId,
          "account_team.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!membership) {
      throw new Error(`Not a team ${isAdmin ? "admin" : "member"}`);
    }
  };

  const isProjectStakeholderByRequirementId = async (
    request,
    reply,
    isAdmin = false
  ) => {
    const stakeholdership = (
      await fastify.knex
        .from("requirement")
        .join("reqgroup", "reqgroup.id", "requirement.reqgroup_id")
        .join("stakeholder_project", "stakeholder_project.project_id", "reqgroup.project_id")
        .select("stakeholder_project.id")
        .where({
          "requirement.id": request.params.requirementId,
          "stakeholder_project.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!stakeholdership) {
      throw new Error(`Not a stakeholder`);
    }
  };

  const isTeamMemberByReqversionId = async (
    request,
    reply,
    isAdmin = false
  ) => {
    const membership = (
      await fastify.knex
        .from("reqversion")
        .join("requirement", "requirement.id", "reqversion.requirement_id")
        .join("reqgroup", "reqgroup.id", "requirement.reqgroup_id")
        .join("project", "project.id", "reqgroup.project_id")
        .join("account_team", "account_team.team_id", "project.team_id")
        .select("account_team.id")
        .where({
          "reqversion.id": request.params.reqversionId,
          "account_team.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!membership) {
      throw new Error(`Not a team ${isAdmin ? "admin" : "member"}`);
    }
  };

  const isProjectStakeholderByReqversionId = async (
    request,
    reply,
    isAdmin = false
  ) => {
    const stakeholdership = (
      await fastify.knex
        .from("reqversion")
        .join("requirement", "requirement.id", "reqversion.requirement_id")
        .join("stakeholder_project", "stakeholder_project.project_id", "requirement.project_id")
        .select("stakeholder_project.id")
        .where({
          "reqversion.id": request.params.reqversionId,
          "stakeholder_project.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!stakeholdership) {
      throw new Error(`Not a stakeholder`);
    }
  };


  const isTeamMemberByCommentId = async (
    request,
    reply,
    isAdmin = false
  ) => {
    const membershipReqversion = (
      await fastify.knex
        .from("comment")
        .join("reqversion", "reqversion.id", "comment.reqversion_id")
        .join("requirement", "requirement.id", "reqversion.requirement_id")
        .join("reqgroup", "reqgroup.id", "requirement.reqgroup_id")
        .join("project", "project.id", "reqgroup.project_id")
        .join("account_team", "account_team.team_id", "project.team_id")
        .select("account_team.id")
        .where({
          "comment.id": request.params.commentId,
          "account_team.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    const membershipReview = (
      await fastify.knex
        .from("comment")
        .join("stakeholderReview", "stakeholderReview.id", "comment.stakeholderReview_id")
        .join("project", "project.id", "stakeholderReview.project_id")
        .join("account_team", "account_team.team_id", "project.team_id")
        .select("account_team.id")
        .where({
          "comment.id": request.params.commentId,
          "account_team.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    const membershipFile = (
      await fastify.knex
        .from("comment")
        .join("file", "file.id", "comment.file_id")
        .join("project", "project.id", "file.project_id")
        .join("account_team", "account_team.team_id", "project.team_id")
        .select("account_team.id")
        .where({
          "comment.id": request.params.commentId,
          "account_team.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!membershipReqversion && !membershipReview && !membershipFile) {
      throw new Error(`Not a team ${isAdmin ? "admin" : "member"}`);
    }
  };

  const isProjectStakeholderByCommentId = async (
    request,
    reply,
    isAdmin = false
  ) => {
    const stakeholdershipReqversion = (
      await fastify.knex
        .from("comment")
        .join("reqversion", "reqversion.id", "comment.reqversion_id")
        .join("requirement", "requirement.id", "reqversion.requirement_id")
        .join("stakeholder_project", "stakeholder_project.project_id", "requirement.project_id")
        .select("stakeholder_project.id")
        .where({
          "comment.id": request.params.commentId,
          "stakeholder_project.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    const stakeholdershipReview = (
      await fastify.knex
        .from("comment")
        .join("stakeholderReview", "stakeholderReview.id", "comment.stakeholderReview_id")
        .join("stakeholder_project", "stakeholder_project.project_id", "stakeholderReview.project_id")
        .select("stakeholder_project.id")
        .where({
          "comment.id": request.params.commentId,
          "stakeholder_project.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!stakeholdershipReqversion && !stakeholdershipReview) {
      throw new Error(`Not a stakeholder`);
    }
  };

  const isTeamMemberByQuestionnaireId = async (
    request,
    reply,
    isAdmin = false
  ) => {
    const membership = (
      await fastify.knex
        .from("brainstormForm")
        .join("project", "project.id", "brainstormForm.project_id")
        .join("account_team", "account_team.team_id", "project.team_id")
        .select("account_team.id")
        .where({
          "brainstormForm.id": request.params.questionnaireId,
          "account_team.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!membership) {
      throw new Error(`Not a team ${isAdmin ? "admin" : "member"}`);
    }
  };

  const isProjectStakeholderByQuestionnaireId = async (request, reply) => {
    const association = (
      await fastify.knex
        .from("brainstormForm")
        .join("project", "project.id", "brainstormForm.project_id")
        .join("stakeholder_project", "stakeholder_project.project_id", "project.id")
        .select("stakeholder_project.id")
        .where({
          "brainstormForm.id": request.params.questionnaireId,
          "stakeholder_project.account_id": request.user.id
        })
    ).length;
    if (!association) {
      throw new Error(`Not a project stakeholder`);
    }
  };

  const isTeamMemberByPromptId = async (
    request,
    reply,
    isAdmin = false
  ) => {
    const membership = (
      await fastify.knex
        .from("brainstormPrompt")
        .join("brainstormForm", "brainstormForm.id", "brainstormPrompt.brainstormForm_id")
        .join("project", "project.id", "brainstormForm.project_id")
        .join("account_team", "account_team.team_id", "project.team_id")
        .select("account_team.id")
        .where({
          "brainstormPrompt.id": request.params.promptId,
          "account_team.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!membership) {
      throw new Error(`Not a team ${isAdmin ? "admin" : "member"}`);
    }
  };

  const isTeamMemberByResponseId = async (
    request,
    reply,
    isAdmin = false
  ) => {
    const membership = (
      await fastify.knex
        .from("brainstormResponse")
        .join("brainstormPrompt", "brainstormResponse.brainstormPrompt_id", "brainstormPrompt.id")
        .join("brainstormForm", "brainstormForm.id", "brainstormPrompt.brainstormForm_id")
        .join("project", "project.id", "brainstormForm.project_id")
        .join("account_team", "account_team.team_id", "project.team_id")
        .select("account_team.id")
        .where({
          "brainstormResponse.id": request.params.responseId,
          "account_team.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!membership) {
      throw new Error(`Not a team ${isAdmin ? "admin" : "member"}`);
    }
  };

  const isTeamMemberByReactionId = async (
    request,
    reply,
    isAdmin = false
  ) => {
    const membership = (
      await fastify.knex
        .from("brainstormReaction")
        .join("brainstormResponse", "brainstormReaction.brainstormResponse_id", "brainstormResponse.id")
        .join("brainstormPrompt", "brainstormResponse.brainstormPrompt_id", "brainstormPrompt.id")
        .join("brainstormForm", "brainstormForm.id", "brainstormPrompt.brainstormForm_id")
        .join("project", "project.id", "brainstormForm.project_id")
        .join("account_team", "account_team.team_id", "project.team_id")
        .select("account_team.id")
        .where({
          "brainstormReaction.id": request.params.reactionId,
          "account_team.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!membership) {
      throw new Error(`Not a team ${isAdmin ? "admin" : "member"}`);
    }
  };

  const isTeamMemberByExternalStakeholderId = async (request, reply, isAdmin = false) => {
    const membership = (
      await fastify.knex
        .from("stakeholder_project")
        .join("project", "project.id", "stakeholder_project.project_id")
        .join("account_team", "account_team.team_id", "project.team_id")
        .select("account_team.id")
        .where({
          "stakeholder_project.id": request.params.externalStakeholderId,
          "account_team.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!membership) {
      throw new Error(`Not a team ${isAdmin ? "admin" : "member"}`);
    }
  };

  const isTeamMemberByReviewId = async (
    request,
    reply,
    isAdmin = false
  ) => {
    const membership = (
      await fastify.knex
        .from("stakeholderReview")
        .join("project", "project.id", "stakeholderReview.project_id")
        .join("account_team", "account_team.team_id", "project.team_id")
        .select("account_team.id")
        .where({
          "stakeholderReview.id": request.params.reviewId,
          "account_team.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!membership) {
      throw new Error(`Not a team ${isAdmin ? "admin" : "member"}`);
    }
  };

  const isProjectStakeholderByReviewId = async (
    request,
    reply,
    isAdmin = false
  ) => {
    const stakeholdership = (
      await fastify.knex
        .from("stakeholderReview")
        .join("stakeholder_project", "stakeholder_project.project_id", "stakeholderReview.project_id")
        .select("stakeholder_project.id")
        .where({
          "stakeholderReview.id": request.params.reviewId,
          "stakeholder_project.account_id": request.user.id,
          ...(isAdmin && { isAdmin }),
        })
    ).length;

    if (!stakeholdership) {
      throw new Error(`Not a stakeholder`);
    }
  };

  fastify.decorate("isCorrectUser", async (request, reply) => {
    if (!request.user) {
      reply.code(401);
      reply.send("Not authenticated");
    }

    if (!request.user.id === request.params.userId) {
      reply.code(403);
      reply.send("Not correct user");
    }
  });

  fastify.decorate("isCommenter", async (request, reply) => {
    if (!request.user) {
      reply.code(401);
      reply.send("Not authenticated");
    }

    const comment = await fastify.knex
      .from("comment")
      .select('*')
      .where("comment.id", request.params.commentId);

    if (!request.user.id === comment.account_id) {
      reply.code(403);
      reply.send("Not correct user");
    }
  });

  const authenticateRoute = async (request, reply, requireAdmin = false, allowStakeholder = false) => {
    const methods = [
      { param: "teamId", memberHandler: isTeamMemberByTeamId },
      { param: "projectId", memberHandler: isTeamMemberByProjectId, stakeholderHandler: isProjectStakeholderByProjectId },
      { param: "templateId", memberHandler: isTeamMemberByTemplateId },
      { param: "stakeholderGroupId", memberHandler: isTeamMemberByStakeholderGroupId, stakeholderHandler: isProjectStakeholderByStakeholderGroupId },
      { param: "fileId", memberHandler: isTeamMemberByFileId, stakeholderHandler: isProjectStakeholderByFileId },
      { param: "reqgroupId", memberHandler: isTeamMemberByReqgroupId, stakeholderHandler: isProjectStakeholderByReqgroupId },
      { param: "requirementId", memberHandler: isTeamMemberByRequirementId, stakeholderHandler: isProjectStakeholderByRequirementId },
      { param: "reqversionId", memberHandler: isTeamMemberByReqversionId, stakeholderHandler: isProjectStakeholderByReqversionId },
      { param: "commentId", memberHandler: isTeamMemberByCommentId, stakeholderHandler: isProjectStakeholderByCommentId },
      { param: "questionnaireId", memberHandler: isTeamMemberByQuestionnaireId, stakeholderHandler: isProjectStakeholderByQuestionnaireId },
      { param: "promptId", memberHandler: isTeamMemberByPromptId },
      { param: "responseId", memberHandler: isTeamMemberByResponseId },
      { param: "reactionId", memberHandler: isTeamMemberByReactionId },
      { param: "userclassId", memberHandler: isTeamMemberByUserclassId, stakeholderHandler: isProjectStakeholderByUserclassId },
      { param: "externalStakeholderId", memberHandler: isTeamMemberByExternalStakeholderId },
      { param: "reviewId", memberHandler: isTeamMemberByReviewId, stakeholderHandler: isProjectStakeholderByReviewId },
    ];
    const method = methods.find(x => request.params[x.param]);
    if (!method) {
      throw new Error("Could not authenticate using URL parameters");
    }
    if (allowStakeholder) {
      try {
        await method.memberHandler(request, reply);
      }
      catch {
        await method.stakeholderHandler(request, reply);
      }
    }
    else {
      await method.memberHandler(request, reply, requireAdmin);
    }
  };

  fastify.decorate("hasProjectAccess", async function (request, reply) {
    if (!request.user) {
      reply.code(401);
      reply.send("Not authenticated");
    }
    try {
      await authenticateRoute(request, reply, false, true);
    }
    catch (error) {
      reply.code(403);
      reply.send(error);
    }
  });

  fastify.decorate("isTeamMember", async function (request, reply) {
    if (!request.user) {
      reply.code(401);
      reply.send("Not authenticated");
    }
    try {
      await authenticateRoute(request, reply, false, false);
    } catch (error) {
      reply.code(403);
      reply.send(error);
    }
  });

  fastify.decorate("isTeamAdmin", async function (request, reply) {
    if (!request.user) {
      reply.code(401);
      reply.send("Not authenticated");
    }
    try {
      await authenticateRoute(request, reply, true, false);
    }
    catch (error) {
      reply.code(403);
      reply.send(error);
    }
  });

  fastify.decorate("getScopes", async function (account_id, project_id) {
    const scopes = [];

    const teamMembership = await fastify.knex
      .from("project")
      .join("team", "team.id", "project.team_id")
      .join("account_team", "account_team.team_id", "team.id")
      .select("account_team.isAdmin", "account_team.isOwner")
      .where({
        "project.id": project_id,
        "account_team.account_id": account_id
      })
      .first();

    const projectStakeholdership = await fastify.knex
      .from("project")
      .join("stakeholder_project", "stakeholder_project.project_id", "project.id")
      .select("*")
      .where({
        "project.id": project_id,
        "stakeholder_project.account_id": account_id
      })
      .first();

    if (projectStakeholdership) {
      scopes.push("stakeholder");
    }

    if (teamMembership) {
      scopes.push("member");
    }

    if (teamMembership && teamMembership.isOwner) {
      scopes.push("admin", "owner");
    }
    else if (teamMembership && teamMembership.isAdmin) {
      scopes.push("admin");
    }

    return scopes;
  });
});
