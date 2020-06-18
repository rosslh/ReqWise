const fp = require("fastify-plugin");

module.exports = fp(async function (fastify, opts) {
  fastify.register(require("fastify-jwt"), {
    secret: process.env.JWT_KEY,
  });

  fastify.decorate("authenticate", async function (request, reply) {
    const jwtContent = await request.jwtVerify();
    const account = await fastify.knex
      .from("account")
      .select("id")
      .where("email", jwtContent.email)
      .first();
    if (jwtContent.id === account.id) {
      request.user = jwtContent;
    } else {
      reply.code(403);
      reply.send("Email and ID do not match");
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

  fastify.decorate("isTeamMember", async function (request, reply) {
    if (!request.user) {
      reply.code(401);
      reply.send("Not authenticated");
    }
    if (request.params.teamId) {
      return isTeamMemberByTeamId(request, reply);
    } else if (request.params.projectId) {
      return isTeamMemberByProjectId(request, reply);
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
    }
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
    }
  });
});
