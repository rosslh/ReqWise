
exports.up = function (knex) {
    return knex.schema.raw(`
  ALTER TABLE "reqversion" ALTER "priority" SET DEFAULT 'medium'
`);
};

exports.down = function (knex) {

};
