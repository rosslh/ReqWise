const resetTable = async (tableName, knex) => {
  await knex(tableName).del();
  await knex.raw(`
    CREATE SEQUENCE IF NOT EXISTS "${tableName}_id_seq";
    ALTER SEQUENCE "${tableName}_id_seq" RESTART WITH 1;
    UPDATE "${tableName}" SET id=nextval(format('%I', '${tableName}_id_seq'));
  `);
};
exports.seed = async function (knex) {
  if (!["qa", "dev"].includes(process.env.KNEXMODE)) {
    throw new Error("Environment is not QA or dev! Aborting.")
  }
  else {
    const tables = [
      'account_alert',
      'alert',
      'reqversion',
      'requirement',
      'reqgroup',
      'stakeholderGroup',
      'userclass',
      'file',
      'per_project_unique_id',
      'project',
      'projectTemplate',
      'account_team',
      'account',
      'slackUser',
      'team',
      'stakeholder_project',
      'account_stakeholderGroup',
      'stakeholderGroup_reqgroup'
    ];

    for (const t of tables) {
      await resetTable(t, knex);
    }

    await knex('account').insert([
      {
        // id: 1,
        password_hash: "$2b$10$DAfKfLLJ9ci5a/QP4DHWBO6aaW0yXgl7tYDbkwXY31.S1yeCV0.yW",
        name: "Team Owner",
        is_verified: true,
        email: "test.owner@reqwise.com"
      },
      {
        // id: 1,
        password_hash: "$2b$10$DAfKfLLJ9ci5a/QP4DHWBO6aaW0yXgl7tYDbkwXY31.S1yeCV0.yW",
        name: "Team Member",
        is_verified: true,
        email: "test.member@reqwise.com"
      },
      {
        // id: 1,
        password_hash: "$2b$10$DAfKfLLJ9ci5a/QP4DHWBO6aaW0yXgl7tYDbkwXY31.S1yeCV0.yW",
        name: "External Stakeholder",
        is_verified: true,
        email: "test.stakeholder@reqwise.com"
      },
    ]);

    await knex('team').insert([
      {
        // id: 1,
        name: "Test team"
      }
    ]);

    await knex('account_team').insert([
      {
        account_id: 1,
        team_id: 1,
        isAdmin: true,
        isOwner: true,
      },
      {
        account_id: 2,
        team_id: 1,
        isAdmin: false,
        isOwner: false,
      },
    ]);

    await knex('project').insert([
      {
        // id: 1,
        name: "Test project",
        team_id: 1,
        created_by: 1
      }
    ]);

    await knex('per_project_unique_id').insert([
      {
        // id: 1,
        readable_id: 1,
        project_id: 1
      },
      {
        id: 2,
        readable_id: 2,
        project_id: 1
      },
      {
        id: 3,
        readable_id: 3,
        project_id: 1
      },
    ]);

    await knex('reqgroup').insert([
      {
        // id: 1,
        project_id: 1,
        name: "Test feature",
        ppuid_id: 1,
        type: "feature",
        created_by: 1
      }
    ]);

    await knex('requirement').insert([
      {
        // id: 1,
        project_id: 1,
        reqgroup_id: 1,
        ppuid_id: 1
      }
    ]);

    await knex('reqversion').insert([
      {
        requirement_id: 1,
        account_id: 1,
        updated_by: 1,
        status: "proposed",
        priority: "medium",
        description: "Test requirement",
      }
    ]);

    await knex('stakeholderGroup').insert([
      {
        // id: 1,
        name: "Customer",
        project_id: 1,
        ppuid_id: 3
      }
    ]);

    //

    await knex('stakeholder_project').insert([
      {
        // id: 1,
        account_id: 3,
        project_id: 1
      }
    ]);

    await knex('account_stakeholderGroup').insert([
      {
        // id: 1,
        account_id: 3,
        stakeholderGroup_id: 1
      }
    ]);

    await knex('stakeholderGroup_reqgroup').insert([
      {
        // id: 1,
        reqgroup_id: 1,
        stakeholderGroup_id: 1
      }
    ]);
  }
};
