
exports.up = function (knex) {
    return knex.schema.raw(`
    ALTER TABLE "stakeholderGroup_reqgroup" 
    DROP COLUMN "role"
    `);
};

exports.down = function (knex) {

};
