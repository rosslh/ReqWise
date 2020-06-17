
exports.up = function (knex) {
    return Promise.all([
        knex.schema.dropTable("stakeholderGroup_requirement"),
        knex.schema.createTable("requirement_userclass", (table) => {
            table.increments("id").primary();
            table
                .integer("requirement_id")
                .references("requirement.id")
                .onUpdate("CASCADE")
                .onDelete("CASCADE")
                .unsigned()
                .notNullable();
            table
                .integer("userclass_id")
                .references("userclass.id")
                .onUpdate("CASCADE")
                .onDelete("CASCADE")
                .unsigned()
                .notNullable();
        })]);
};

exports.down = function (knex) {
    knex.schema.dropTable("userclass_requirement")
};
