module.exports = async function (fastify, opts) {
  const sleep = ms => new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

  const userIsMemberByProject = async (userId, projectId) => !!(
    await fastify.knex
      .from("project")
      .join("account_team", "account_team.team_id", "project.team_id")
      .select("account_team.id")
      .where({
        "project.id": projectId,
        "account_team.account_id": userId
      })
  ).length;

  const userIsStakeholderByProject = async (userId, projectId) => !!(
    await fastify.knex
      .from("project")
      .join("stakeholder_project", "stakeholder_project.project_id", "project.id")
      .select("stakeholder_project.id")
      .where({
        "project.id": projectId,
        "stakeholder_project.account_id": userId
      })
  ).length;

  const userIsMemberByReqversion = async (userId, reqversionId) => !!(
    await fastify.knex
      .from("reqversion")
      .join("requirement", "requirement.id", "reqversion.requirement_id")
      .join("reqgroup", "reqgroup.id", "requirement.reqgroup_id")
      .join("project", "project.id", "reqgroup.project_id")
      .join("account_team", "account_team.team_id", "project.team_id")
      .select("account_team.id")
      .where({
        "reqversion.id": reqversionId,
        "account_team.account_id": userId,
      })
  ).length;

  const userIsStakeholderByReqversion = async (userId, reqversionId) => !!(
    await fastify.knex
      .from("reqversion")
      .join("requirement", "requirement.id", "reqversion.requirement_id")
      .join("stakeholder_project", "stakeholder_project.project_id", "requirement.project_id")
      .select("stakeholder_project.id")
      .where({
        "reqversion.id": reqversionId,
        "stakeholder_project.account_id": userId
      })
  ).length;

  fastify.io.on('connection', async (socket) => {
    console.log('user connected');

    socket.on('getProjectNotifications', async ({ jwt, data }) => {
      let timestamp = Date.now();
      const user = fastify.jwt.verify(jwt);

      const projectId = fastify.deobfuscateId(data.projectId);

      const isStakeholder = await userIsStakeholderByProject(user.id, projectId);
      const isMember = await userIsMemberByProject(user.id, projectId);

      if (!isMember && !isStakeholder) {
        console.log("Unauthorized socket.io access");
        socket.disconnect();
        return;
      }

      const interval = 6000;

      while (true) { // eslint-disable-line no-constant-condition
        await sleep(interval);
        const projectUpdated = !!(
          await fastify.knex
            .from("project")
            .select("id")
            .where({
              "id": projectId
            })
            .where('reqgroups_updated_at', '>', new Date(timestamp - interval))
        ).length;

        let updatedReqgroups = (
          await fastify.knex
            .from("reqgroup")
            .select("id")
            .where({
              "project_id": projectId
            })
            .where('updated_at', '>', new Date(timestamp - interval))
            .where('updated_by', "!=", user.id)
        ).map(x => fastify.obfuscateId(x.id));

        let newReqversionReqgroups = (await fastify.knex
          .from("reqversion")
          .join("requirement", "requirement.id", "reqversion.requirement_id")
          .join("reqgroup", "reqgroup.id", "requirement.reqgroup_id")
          .select("reqgroup.id as id")
          .where({
            "reqgroup.project_id": projectId
          })
          .where('reqversion.created_at', '>', new Date(timestamp - interval))
          .where('account_id', "!=", user.id)
        ).map(x => fastify.obfuscateId(x.id));

        updatedReqgroups = Array.from(new Set(updatedReqgroups.concat(newReqversionReqgroups)));
        if (projectUpdated || updatedReqgroups.length) {
          socket.emit('message', fastify.obfuscateIdsInJson(JSON.stringify({
            projectUpdated,
            updatedReqgroups
          })));
        }
        timestamp = Date.now();
      }
    });

    socket.on('getUserAlertStatus', async ({ jwt, data }) => {
      const user = fastify.jwt.verify(jwt);
      const interval = 8000;

      while (true) { // eslint-disable-line no-constant-condition
        await sleep(interval);

        const unreadAlerts = !!(await fastify.knex
          .from("account_alert")
          .select("*")
          .where({ "account_alert.account_id": user.id, "is_read": false })).length;

        socket.emit('message', fastify.obfuscateIdsInJson(JSON.stringify({
          unreadAlerts
        })));
      }
    });

    socket.on('getCommentNotifications', async ({ jwt, data }) => {
      let timestamp = Date.now();
      const user = fastify.jwt.verify(jwt);
      const reqversionId = fastify.deobfuscateId(data.reqversionId);
      const { project_id: projectId } = await fastify.knex.from("reqversion")
        .select("project_id")
        .join("requirement", "requirement.id", "reqversion.requirement_id")
        .where("reqversion.id", reqversionId)
        .first();


      const isStakeholder = await userIsStakeholderByReqversion(user.id, projectId);
      const isMember = await userIsMemberByReqversion(user.id, reqversionId);

      if (!isMember && !isStakeholder) {
        console.log("Unauthorized socket.io access");
        socket.disconnect();
        return;
      }

      const interval = 2500;
      while (true) { // eslint-disable-line no-constant-condition
        await sleep(interval);
        let newComments = (await fastify.knex
          .from("comment")
          .select(
            "comment.*",
            "account.name as authorName",
            "account.email as authorEmail",
            "account.imageName as authorImageName",
            "account.placeholderImage as authorPlaceholderImage"
          )
          .leftJoin("account", "account.id", "=", "comment.account_id")
          .where({
            "comment.reqversion_id": reqversionId
          })
          .where('comment.created_at', '>', new Date(timestamp - interval))
        ).map(x => ({ ...x, id: fastify.obfuscateId(x.id) }));

        newComments = await Promise.all(newComments.map(async comment => {
          const authorScopes = await fastify.getScopes(comment.account_id, projectId);
          return { ...comment, authorScopes };
        }));

        if (newComments.length) {
          socket.emit('message', fastify.obfuscateIdsInJson(JSON.stringify(
            newComments
          )));
        }
        timestamp = Date.now();
      }
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};
