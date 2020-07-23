const rp = require('request-promise');

module.exports = async function (fastify, opts) {
  const postTeamSchema = {
    body: {
      type: "object",
      required: ["name", "description"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
          team_id: { type: "number" },
        },
      },
    },
  };
  fastify.post(
    "/",
    {
      preValidation: [fastify.authenticate],
      schema: postTeamSchema,
    },
    async function (request, reply) {
      const { name, description } = request.body;

      const [team_id] = await fastify
        .knex("team")
        .insert({
          name,
          description,
        })
        .returning("id");

      await fastify.knex("account_team").insert({
        account_id: request.user.id,
        team_id,
        isAdmin: true,
        isOwner: true,
      });

      return { team_id };
    }
  );

  const getTeamSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
          name: { type: "string" },
          description: { type: "string" },
          isAdmin: { type: "boolean" },
        },
        required: ["id", "name", "description", "isAdmin"],
      },
    },
  };
  fastify.get(
    "/:teamId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getTeamSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("team")
        .select(
          "team.name as name",
          "team.description as description",
          "account_team.isAdmin as isAdmin",
          "team.id as id",
        )
        .where("team.id", request.params.teamId)
        .join("account_team", {
          "account_team.team_id": "team.id",
          "account_team.account_id": request.user.id,
        })
        .first();
    }
  );

  const putTeamSchema = {
    body: {
      type: "object",
      required: ["name", "description"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
    "/:teamId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: putTeamSchema,
    },
    async function (request, reply) {
      const { name, description } = request.body;
      return (
        await fastify
          .knex("team")
          .update({ name, description })
          .where("id", request.params.teamId)
          .returning(["name", "description"])
      )[0];
    }
  );

  const deleteTeamSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
    "/:teamId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: deleteTeamSchema,
    },
    async function (request, reply) {
      // TODO: Ensure you also delete dependent entities
      await fastify.knex("team").where("id", request.params.teamId).del();
      return ["success"];
    }
  );

  const getTeamMembersSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
            name: { type: "string" },
            email: { type: "string" },
            isAdmin: { type: "boolean" },
            isOwner: { type: "boolean" },
          },
          required: ["id", "name", "email", "isAdmin", "isOwner"],
        },
      },
    },
  };
  fastify.get(
    "/:teamId/members",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getTeamMembersSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("account_team")
        .select(
          "account.id",
          "account.name",
          "account.email",
          "account_team.isAdmin",
          "account_team.isOwner"
        )
        .where("team_id", request.params.teamId)
        .join("account", "account.id", "=", "account_team.account_id");
    }
  );

  const postTeamAdminSchema = {
    body: {
      type: "object",
      properties: {
        accountId: { type: ["number", "string"] },
      }
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
  fastify.post(
    "/:teamId/admins",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: postTeamAdminSchema,
    },
    async function (request, reply) {
      return await fastify
        .knex("account_team")
        .where({ account_id: fastify.deobfuscateId(request.body.accountId), team_id: request.params.teamId })
        .update({
          isAdmin: true
        })
        .returning("id");
    }
  );

  const deleteTeamAdminSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
        adminId: { type: "number" },
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
  fastify.delete(
    "/:teamId/admins/:adminId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: deleteTeamAdminSchema,
    },
    async function (request, reply) {
      const membership = await fastify
        .knex("account_team")
        .select("*")
        .where({
          account_id: request.params.adminId,
          team_id: request.params.teamId,
        })
        .first();

      if (!membership.isOwner) {
        return await fastify
          .knex("account_team")
          .where({ account_id: request.params.adminId, team_id: request.params.teamId })
          .update({
            isAdmin: false
          })
          .returning("id");
      }
      return ["Owner must be admin"]
    }
  );

  const getTeamInvitesSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
            isAdmin: { type: "boolean" },
          },
          required: ["inviteeEmail", "isAdmin", "id"],
        },
      },
    },
  };
  fastify.get(
    "/:teamId/invites",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getTeamInvitesSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("teamInvite")
        .select("*")
        .where("team_id", request.params.teamId);
    }
  );

  const postTeamInviteSchema = {
    body: {
      type: "object",
      required: ["inviteeEmail", "isAdmin"],
      properties: {
        inviteeEmail: { type: "string" },
        isAdmin: { type: "boolean" },
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
    "/:teamId/invites",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: postTeamInviteSchema,
    },
    async function (request, reply) {
      const { inviteeEmail, isAdmin } = request.body;

      const memberAlreadyExists = (
        await fastify.knex
          .from("account")
          .select("account.id")
          .where({
            email: inviteeEmail,
            "account_team.team_id": request.params.teamId,
          })
          .join("account_team", "account_team.account_id", "account.id")
      ).length;

      if (memberAlreadyExists) {
        reply.code(409);
        return ["Member already exists"];
      }

      const inviteAlreadyExists = (
        await fastify.knex.from("teamInvite").select("id").where({
          inviteeEmail,
          team_id: request.params.teamId,
        })
      ).length;

      if (inviteAlreadyExists) {
        reply.code(409);
        return ["Invite already exists"];
      }

      await fastify
        .knex("teamInvite")
        .insert({
          inviteeEmail,
          isAdmin,
          inviter_id: request.user.id,
          team_id: request.params.teamId,
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
        teamId: { type: "number" },
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
    "/:teamId/invites/:inviteId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: deleteInviteSchema,
    },
    async function (request, reply) {
      await fastify
        .knex("teamInvite")
        .where({ team_id: request.params.teamId, id: request.params.inviteId })
        .del();
      return ["success"];
    }
  );

  const deleteMemberSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
        memberId: { type: "number" },
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
    "/:teamId/members/:memberId",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: deleteMemberSchema,
    },
    async function (request, reply) {
      const membership = await fastify
        .knex("account_team")
        .select("*")
        .where({
          account_id: request.params.memberId,
          team_id: request.params.teamId,
        })
        .first();

      if (!membership.isOwner) {
        await fastify
          .knex("account_team")
          .select("*")
          .where({
            account_id: request.params.memberId,
            team_id: request.params.teamId,
            isOwner: false,
          })
          .del();
        return ["success"];
      }
      reply.code(400);
      return ["owner cannot leave team"];
    }
  );

  const getTeamProjectsSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
            name: { type: "string" },
          },
          required: ["id", "name"],
        },
      },
    },
  };
  fastify.get(
    "/:teamId/projects",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getTeamProjectsSchema,
    },
    async function (request, reply) {
      return await fastify.knex
        .from("project")
        .select("id", "name")
        .where("team_id", request.params.teamId);
    }
  );

  const businessReqgroupSeeds = [
    { name: "Business opportunity", isPrioritized: true, description: "Describe the business problem being solved. For commercial products, also describe the market in which the product will be competing.", isMaxOneRequirement: false },
    { name: "Business objectives", isPrioritized: true, description: "Summarize the important business benefits the product will provide in a quantitative and measurable way.", isMaxOneRequirement: false },
    { name: "Success metrics", isPrioritized: true, description: "Specify the indicators that stakeholders will use to define and measure success on this project.", isMaxOneRequirement: false },
    { name: "Vision statement", isPrioritized: false, description: "Write a concise vision statement that summarizes the long-term purpose and intent of the product.", isMaxOneRequirement: true },
    { name: "Business risks", isPrioritized: false, description: "Summarize the major business risks associated with developing (or not developing) this product.", isMaxOneRequirement: false },
    { name: "Business assumptions and dependencies", isPrioritized: false, description: "An assumption is a statement that is believed to be true in the absence of proof or definitive knowledge. Incorrect assumptions can potentially keep you from meeting your business objectives. Also record any major dependencies the project has on external factors, such as government regulations or third-party suppliers.", isMaxOneRequirement: false },
  ];

  const postProjectSchema = {
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
        teamId: { type: "number" },
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
        items: { type: "number" },
      },
    },
  };
  fastify.post(
    "/:teamId/projects",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: postProjectSchema,
    },
    async function (request, reply) {
      const { name } = request.body;

      const [project_id] = await fastify
        .knex("project")
        .insert({
          name,
          team_id: request.params.teamId,
          created_by: request.user.id,
        })
        .returning("id");

      await Promise.all(businessReqgroupSeeds.map(async (reqgroup, i) => {
        const ppuid_id = (await fastify
          .knex("per_project_unique_id")
          .insert({
            project_id,
            readable_id: i + 1
          })
          .returning("id"))[0];

        await fastify
          .knex("reqgroup")
          .insert({
            project_id,
            name: reqgroup.name,
            description: reqgroup.description,
            type: "business",
            ppuid_id,
            isMaxOneRequirement: reqgroup.isMaxOneRequirement,
            isDeletable: false,
            isPrioritized: reqgroup.isPrioritized,
          })
          .returning("id");
      }));

      return [project_id];
    }
  );

  const putTeamSlackSchema = {
    body: {
      type: "object",
      required: ["code"],
      properties: {
        code: { type: "string" }
      },
    },
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
          slackTeamId: { type: "string" }
        },
      },
    },
  };

  fastify.put(
    "/:teamId/slack",
    {
      preValidation: [fastify.authenticate, fastify.isTeamAdmin],
      schema: putTeamSlackSchema,
    },
    async function (request, reply) {
      const { code, redirect_uri } = request.body;

      var options = {
        method: 'POST',
        uri: "https://slack.com/api/oauth.v2.access",
        form: {
          code,
          redirect_uri,
          "client_id": process.env.REQWISE_SLACK_CLIENT_ID,
          "client_secret": process.env.REQWISE_SLACK_CLIENT_SECRET
        },
        headers: {
          /* 'content-type': 'application/x-www-form-urlencoded' */ // Is set automatically
        }
      };

      const res = JSON.parse(await rp(options));

      const { name: slackTeamName, id: slackTeamId } = res.team;
      const { access_token: slackAccessToken, bot_user_id: slackBotUserId } = res;

      const slackUsers = (await fastify.slack.users.list({ token: slackAccessToken })).members;

      slackUsers.forEach(async user => {
        try {
          const [id] = await fastify
            .knex("slackUser")
            .insert({
              name: user.profile.real_name,
              slackId: user.id,
              slackTeamId: user.team_id,
              email: user.profile.email,
              team_id: request.params.teamId
            })
            .returning("id");

          if (user.profile.email) {
            await fastify.knex("account")
              .where("account.email", user.profile.email)
              .update({
                slackUser_id: id
              })
              .returning("id");
          }
        }
        catch (e) {
          console.error(e);
        }
      });

      return (
        await fastify
          .knex("team")
          .update({ slackTeamName, slackTeamId, slackAccessToken, slackBotUserId })
          .where("id", request.params.teamId)
          .returning(["slackTeamId"])
      )[0];
    }
  );

  const getProjectTemplatesSchema = {
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
  fastify.post(
    "/:teamId/project-templates",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getProjectTemplatesSchema,
    },
    async function (request, reply) {
      const { projectId } = request.body;
      const templateSourceId = fastify.deobfuscateId(projectId);
      const project = await fastify.knex.from("project").select("*").where({ id: templateSourceId }).first();
      const reqgroups = await fastify.knex.from("reqgroup").select("*").where({ project_id: templateSourceId });
      const requirements = await fastify.knex.from("requirement").select("*").where({ project_id: templateSourceId });
      const userclasses = await fastify.knex.from("userclass").select("*").where({ project_id: templateSourceId });
      const stakeholderGroups = await fastify.knex.from("userclass").select("*").where({ project_id: templateSourceId });
      const files = await fastify.knex.from("userclass").select("*").where({ project_id: templateSourceId });
      const questionnaires = await fastify.knex.from("brainstormForm").select("*").where({ project_id: templateSourceId });
      const prompts = await fastify.knex.from("brainstormPrompt").select("brainstormPrompt.*")
        .join("brainstormForm", "brainstormForm.id", "brainstormPrompt.brainstormForm_id")
        .where({ project_id: templateSourceId });

      const data = { project, reqgroups, requirements, userclasses, stakeholderGroups, files, questionnaires, prompts };

      const [template_id] = await fastify
        .knex("projectTemplate")
        .insert({
          name: project.name,
          team_id: request.params.teamId,
          created_by: request.user.id,
          data: fastify.obfuscateIdsInJson(JSON.stringify(data))
        })
        .returning("id");
      return [template_id];
    });

  const getTeamProjectTemplatesSchema = {
    queryString: {},
    params: {
      type: "object",
      properties: {
        teamId: { type: "number" },
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
            name: { type: "string" },
            data: { type: "string" },
            created_at: { type: "string" }
          },
        },
      },
    },
  };
  fastify.get(
    "/:teamId/project-templates",
    {
      preValidation: [fastify.authenticate, fastify.isTeamMember],
      schema: getTeamProjectTemplatesSchema,
    },
    async function (request, reply) {
      const templates = await fastify.knex
        .from("projectTemplate")
        .select("id", "name", "data", "created_at")
        .where("team_id", request.params.teamId);
      return templates.map(t => ({ ...t, data: JSON.stringify(t.data, null, 2) }));
    }
  );
};
