
exports.up = function (knex) {
    return knex.schema.raw(`
    ALTER TABLE "requirement" 
    drop constraint requirement_parent_requirement_id_foreign,
    add constraint requirement_parent_requirement_id_foreign
        foreign key (parent_requirement_id)
        references requirement(id)
        on delete set null;
    `);
};

exports.down = function (knex) {

};
