
exports.up = function (knex) {
    return Promise.all([
        knex.schema.createTable("file_requirement", (table) => {
            table.increments("id").primary();
            table
                .integer("requirement_id")
                .references("requirement.id")
                .onUpdate("CASCADE")
                .onDelete("CASCADE")
                .unsigned()
                .notNullable();
            table
                .integer("file_id")
                .references("file.id")
                .onUpdate("CASCADE")
                .onDelete("CASCADE")
                .unsigned()
                .notNullable();
        })]);
};

exports.down = function (knex) {
    knex.schema.dropTable("file_requirement")
};
