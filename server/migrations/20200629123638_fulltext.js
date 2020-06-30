exports.up = function (knex, Promise) {
    return knex.schema.raw(`
    CREATE INDEX REQGROUP_SEARCH_IDX ON "reqgroup" USING gin(to_tsvector('english', name || ' ' || coalesce(description, '')));
    CREATE INDEX FILE_SEARCH_IDX ON "file" USING gin(to_tsvector('english', name || ' ' || coalesce(description, '')));
    CREATE INDEX USERCLASS_SEARCH_IDX ON "userclass" USING gin(to_tsvector('english', name || ' ' || coalesce(description, '') || ' ' || coalesce(persona, '')));
    CREATE INDEX STAKEHOLDERGROUP_SEARCH_IDX ON "stakeholderGroup" USING gin(to_tsvector('english', name || ' ' || coalesce(description, '')));
    CREATE INDEX REQVERSION_SEARCH_IDX ON "reqversion" USING gin(to_tsvector('english', coalesce(description, '') || ' ' || coalesce(rationale, '')));
    `);
};

// The reverse migration is similar
exports.down = function (knex, Promise) {
    return knex.schema.raw(`
    DROP INDEX REQGROUP_SEARCH_IDX;
    DROP INDEX FILE_SEARCH_IDX;
    DROP INDEX USERCLASS_SEARCH_IDX;
    DROP INDEX STAKEHOLDERGROUP_SEARCH_IDX;
    DROP INDEX REQVERSION_SEARCH_IDX;
    `);
};