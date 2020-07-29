
exports.up = function (knex) {
  return knex.schema.raw(`
    ALTER TABLE "brainstormPrompt"
    drop constraint brainstormprompt_ppuid_id_foreign,
    add constraint brainstormprompt_ppuid_id_foreign
        foreign key (ppuid_id)
        references per_project_unique_id(id)
        on delete cascade;
    `);
};

exports.down = function (knex) {

};
