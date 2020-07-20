
exports.up = function (knex) {
    return Promise.all([
        knex.schema.table('brainstormPrompt_reqgroup', function (table) {
            table.unique(["brainstormPrompt_id", "reqgroup_id"])
        }),
        knex.schema.table('brainstormPrompt_requirement', function (table) {
            table.unique(["brainstormPrompt_id", "requirement_id"])
        }),
        knex.schema.table('requirement_userclass', function (table) {
            table.unique(["userclass_id", "requirement_id"])
        }),
        knex.schema.table('stakeholderGroup_reqgroup', function (table) {
            table.unique(["stakeholderGroup_id", "reqgroup_id"])
        }),
        knex.schema.table('file_requirement', function (table) {
            table.unique(["file_id", "requirement_id"])
        }),
    ]);
};

exports.down = function (knex) {

};
