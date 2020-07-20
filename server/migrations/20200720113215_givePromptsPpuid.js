exports.up = function (knex) {
    return Promise.all([knex.schema.table('brainstormPrompt', function (table) {
        table
            .integer("ppuid_id")
            .references("per_project_unique_id.id")
            .unsigned()
            .notNullable(); /* uniqueness enforced in business logic */
    })])
};

exports.down = function (knex) {

};
