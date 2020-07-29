
exports.up = function (knex) {
  return knex.schema.raw(`
    ALTER TABLE "userclass"
    drop constraint userclass_project_id_foreign,
    add constraint userclass_project_id_foreign
        foreign key (project_id)
        references project(id)
        on delete cascade;
    `);
};

exports.down = function (knex) {

};
