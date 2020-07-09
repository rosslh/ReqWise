const fp = require("fastify-plugin");

module.exports = fp(function (fastify, opts, done) {
    fastify.decorate("createAlert", async function (actionType, entityType, description, entity_id, project_id, created_by, newValue) {
        const entityId = {};

        if (entityType === "reqgroup") {
            entityId.entity_reqgroup_id = entity_id;
        } else if (entityType === "requirement") {
            entityId.entity_requirement_id = entity_id;
        } else if (entityType === "reqversion") {
            entityId.entity_reqversion_id = entity_id;
        } else if (entityType === "file") {
            entityId.entity_file_id = entity_id;
        } else if (entityType === "stakeholderGroup") {
            entityId.entity_stakeholderGroup_id = entity_id;
        } else if (entityType === "userclass") {
            entityId.entity_userclass_id = entity_id;
        }

        const alert_id = (await fastify
            .knex("alert")
            .insert({
                actionType,
                entityType,
                description,
                ...entityId,
                project_id,
                created_by,
                newValue
            })
            .returning("id"))[0];

        const members = (await fastify.knex
            .from("project")
            .select(
                "*"
            )
            .where("project.id", "=", project_id)
            .join("account_team", "account_team.team_id", "project.team_id")
            .join("account", "account.id", "=", "account_team.account_id")
        );

        members.forEach(async member => {
            await fastify
                .knex("account_alert")
                .insert({
                    alert_id,
                    account_id: member.id
                });
        });

        return "success";
    });

    done();
});
