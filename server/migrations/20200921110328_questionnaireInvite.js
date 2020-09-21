
exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable("brainstormInvite", (table) => {
      table.increments("id").primary();
      table.string("inviteeEmail").notNullable();
      table.integer("brainstormForm_id").references("brainstormForm.id").unsigned().notNullable()
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
      table.unique(["inviteeEmail", "brainstormForm_id"]);
    })
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTable("brainstormInvite")
  ])
};
