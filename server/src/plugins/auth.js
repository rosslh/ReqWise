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
      .where("email", jwtContent.email)
      .first();
    if (jwtContent.id === account.id) {
      request.user = { ...jwtContent, imageName: account.imageName };
    } else {
      reply.code(403);
      reply.send("Email and ID do not match");
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

  fastify.decorate("allowAnonIfPublic", async function (request, reply) {
    const { brainstormForm_id: formId } = await getFormId(request.params);
    const { is_public: isPublic } = await fastify.knex.from("brainstormForm").select("is_public").where({ id: formId }).first();

    const verify = async () => {
      const jwtContent = await request.jwtVerify();
      const account = await fastify.knex
        .from("account")
        .select("id", "imageName")
        .where("email", jwtContent.email)
        .first();
      if (jwtContent.id === account.id) {
        request.user = { ...jwtContent, imageName: account.imageName };
      } else {
        reply.code(403);
        reply.send("Email and ID do not match");
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
      reply.code(403);
      reply.send(`Not a team ${isAdmin ? "admin" : "member"}`);
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
      reply.code(403);
      reply.send(`Not a team ${isAdmin ? "admin" : "member"}`);
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
      reply.code(403);
      reply.send(`Not a project stakeholder`);
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
      reply.code(403);
      reply.send(`Not a team ${isAdmin ? "admin" : "member"}`);
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
      reply.code(403);
      reply.send(`Not a team ${isAdmin ? "admin" : "member"}`);
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
      reply.code(403);
      reply.send(`Not a team ${isAdmin ? "admin" : "member"}`);
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
      reply.code(403);
      reply.send(`Not a team ${isAdmin ? "admin" : "member"}`);
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
      reply.code(403);
      reply.send(`Not a team ${isAdmin ? "admin" : "member"}`);
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
      reply.code(403);
      reply.send(`Not a team ${isAdmin ? "admin" : "member"}`);
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
      reply.code(403);
      reply.send(`Not a team ${isAdmin ? "admin" : "member"}`);
    }
  };

  const isTeamMemberByCommentId = async (
    request,
    reply,
    isAdmin = false
  ) => {
    const membership = (
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

    if (!membership) {
      reply.code(403);
      reply.send(`Not a team ${isAdmin ? "admin" : "member"}`);
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
      reply.code(403);
      reply.send(`Not a team ${isAdmin ? "admin" : "member"}`);
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
      reply.code(403);
      reply.send(`Not a team ${isAdmin ? "admin" : "member"}`);
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
      reply.code(403);
      reply.send(`Not a team ${isAdmin ? "admin" : "member"}`);
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
      reply.code(403);
      reply.send(`Not a team ${isAdmin ? "admin" : "member"}`);
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

  fastify.decorate("hasProjectAccess", async function (request, reply) {
    if (!request.user) {
      reply.code(401);
      reply.send("Not authenticated");
    }
    if (request.params.projectId) {
      return isProjectStakeholderByProjectId(request, reply) || isTeamMemberByProjectId(request, reply);
    }
    throw new Error("Could not authenticate using URL parameters");
  });

  fastify.decorate("isTeamMember", async function (request, reply) {
    if (!request.user) {
      reply.code(401);
      reply.send("Not authenticated");
    }
    if (request.params.teamId) {
      return isTeamMemberByTeamId(request, reply);
    } else if (request.params.projectId) {
      return isTeamMemberByProjectId(request, reply);
    } else if (request.params.templateId) {
      return isTeamMemberByTemplateId(request, reply);
    }
    else if (request.params.stakeholderGroupId) {
      return isTeamMemberByStakeholderGroupId(request, reply);
    }
    else if (request.params.fileId) {
      return isTeamMemberByFileId(request, reply);
    }
    else if (request.params.reqgroupId) {
      return isTeamMemberByReqgroupId(request, reply);
    } else if (request.params.requirementId) {
      return isTeamMemberByRequirementId(request, reply);
    } else if (request.params.reqversionId) {
      return isTeamMemberByReqversionId(request, reply);
    } else if (request.params.commentId) {
      return isTeamMemberByCommentId(request, reply);
    } else if (request.params.questionnaireId) {
      return isTeamMemberByQuestionnaireId(request, reply);
    } else if (request.params.promptId) {
      return isTeamMemberByPromptId(request, reply);
    } else if (request.params.responseId) {
      return isTeamMemberByResponseId(request, reply);
    } else if (request.params.reactionId) {
      return isTeamMemberByReactionId(request, reply);
    } else if (request.params.userclassId) {
      return isTeamMemberByUserclassId(request, reply);
    }
    throw new Error("Could not authenticate using URL parameters");
  });

  fastify.decorate("isTeamAdmin", async function (request, reply) {
    if (!request.user) {
      reply.code(401);
      reply.send("Not authenticated");
    }
    if (request.params.teamId) {
      return isTeamMemberByTeamId(request, reply, true);
    } else if (request.params.projectId) {
      return isTeamMemberByProjectId(request, reply, true);
    } else if (request.params.templateId) {
      return isTeamMemberByTemplateId(request, reply, true);
    }
    else if (request.params.stakeholderGroupId) {
      return isTeamMemberByStakeholderGroupId(request, reply, true);
    }
    else if (request.params.fileId) {
      return isTeamMemberByFileId(request, reply, true);
    }
    else if (request.params.reqgroupId) {
      return isTeamMemberByReqgroupId(request, reply, true);
    } else if (request.params.requirementId) {
      return isTeamMemberByRequirementId(request, reply, true);
    } else if (request.params.reqversionId) {
      return isTeamMemberByReqversionId(request, reply, true);
    } else if (request.params.commentId) {
      return isTeamMemberByCommentId(request, reply, true);
    } else if (request.params.questionnaireId) {
      return isTeamMemberByQuestionnaireId(request, reply, true);
    } else if (request.params.promptId) {
      return isTeamMemberByPromptId(request, reply, true);
    } else if (request.params.responseId) {
      return isTeamMemberByResponseId(request, reply, true);
    } else if (request.params.reactionId) {
      return isTeamMemberByReactionId(request, reply, true);
    } else if (request.params.userclassId) {
      return isTeamMemberByUserclassId(request, reply, true);
    }
    throw new Error("Could not authenticate using URL parameters");
  });
});
