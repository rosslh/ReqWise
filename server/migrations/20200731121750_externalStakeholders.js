
exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable("stakeholder_project", (table) => {
      table.increments("id").primary();
      table
        .integer("account_id")
        .references("account.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table
        .integer("project_id")
        .references("project.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        .unsigned()
        .notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
    }),
    knex.schema.createTable("stakeholderInvite", (table) => {
      table.increments("id").primary();
      table.string("inviteeEmail").notNullable();
      table.integer("project_id").references("project.id").unsigned().notNullable()
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table
        .integer("inviter_id")
        .references("account.id")
        .unsigned()
        .notNullable()
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.integer("stakeholderGroup_id").references("stakeholderGroup.id").unsigned()
        .onUpdate("CASCADE")
        .onDelete("SET NULL");
    })
  ]);
};

exports.down = function (knex) {

};
