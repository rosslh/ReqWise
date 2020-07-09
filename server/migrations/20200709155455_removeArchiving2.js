
exports.up = function (knex) {
    return knex.schema.raw(`
    alter table "requirement"
    drop constraint requirement_reqgroup_id_foreign,
    add constraint requirement_reqgroup_id_foreign
    foreign key (reqgroup_id)
    references reqgroup(id)
    on delete cascade;
    `)
};

exports.down = function (knex) {

};
