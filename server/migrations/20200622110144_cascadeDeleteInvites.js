exports.up = function (knex) {
    return knex.schema.raw(`
    ALTER TABLE "teamInvite" 
    drop constraint teaminvite_team_id_foreign,
    add constraint teaminvite_team_id_foreign
        foreign key (team_id)
        references team(id)
        on delete cascade;
    `);
};

exports.down = function (knex) {

};
