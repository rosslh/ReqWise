exports.up = function (knex, Promise) {
    return knex.schema.table('account', function (t) {
        t.string('imageName');
        t.text('placeholderImage');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table('account', function (t) {
        t.dropColumn('imageName');
        t.dropColumn('placeholderImage');
    });
};