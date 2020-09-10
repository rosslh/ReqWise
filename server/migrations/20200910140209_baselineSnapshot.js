
exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable("baselineSnapshot", (table) => {
      table.increments("id").primary();
      table
        .integer("project_id")
        .references("project.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.text("fileName").notNullable();
    })
  ]);
};

exports.down = function (knex) {

};
