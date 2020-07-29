exports.seed = async function (knex) {
  await knex('account_alert').del().then(() => { knex.raw('TRUNCATE TABLE account_alert RESTART IDENTITY'); });
  await knex('alert').del().then(() => { knex.raw('TRUNCATE TABLE alert RESTART IDENTITY'); });
  await knex('reqversion').del().then(() => { knex.raw('TRUNCATE TABLE reqversion RESTART IDENTITY'); });
  await knex('requirement').del().then(() => { knex.raw('TRUNCATE TABLE requirement RESTART IDENTITY'); });
  await knex('reqgroup').del().then(() => { knex.raw('TRUNCATE TABLE reqgroup RESTART IDENTITY'); });
  await knex('per_project_unique_id').del().then(() => { knex.raw('TRUNCATE TABLE per_project_unique_id RESTART IDENTITY'); });
  await knex('project').del().then(() => { knex.raw('TRUNCATE TABLE project RESTART IDENTITY'); });
  await knex('account_team').truncate()
  await knex('team').del().then(() => { knex.raw('TRUNCATE TABLE team RESTART IDENTITY'); });
  await knex('account').del().then(() => { knex.raw('TRUNCATE TABLE account RESTART IDENTITY'); });


  await knex('account').insert([
    {
      id: 1,
      password_hash: "$2b$10$DAfKfLLJ9ci5a/QP4DHWBO6aaW0yXgl7tYDbkwXY31.S1yeCV0.yW",
      name: "Test Account",
      is_verified: true,
      email: "test@reqwise.com"
    }
  ]);

  await knex('team').insert([
    {
      id: 1,
      name: "Test team (don't delete)"
    }
  ]);

  await knex('account_team').insert([
    {
      account_id: 1,
      team_id: 1,
      isAdmin: true,
      isOwner: true,
    }
  ]);

  await knex('project').insert([
    {
      id: 1,
      name: "Test project (don't delete)",
      team_id: 1,
      created_by: 1
    }
  ]);

  // await knex('reqversion').del()
  // await knex('requirement').del()
  // await knex('reqgroup').del()

  await knex('per_project_unique_id').insert([
    {
      id: 1,
      readable_id: 1,
      project_id: 1
    },
    {
      id: 2,
      readable_id: 2,
      project_id: 1
    },
  ]);

  await knex('reqgroup').insert([
    {
      id: 1,
      project_id: 1,
      name: "Test feature (don't delete)",
      ppuid_id: 1,
      type: "feature",
      created_by: 1
    }
  ]);

  await knex('requirement').insert([
    {
      id: 1,
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
      description: "Test requirement (don't delete)",
    }
  ]);
};
