exports.up = function (knex) {
    return Promise.all([
        knex.schema.raw(`
      ALTER TABLE "brainstormPrompt" DROP CONSTRAINT "brainstormPrompt_responseType_check";
      ALTER TABLE "brainstormPrompt" ADD CONSTRAINT "brainstormPrompt_responseType_check" CHECK ("responseType" IN ('text', 'paragraph', 'dropdown', 'number', 'likert'));
    `)])
};

exports.down = function (knex) {

};