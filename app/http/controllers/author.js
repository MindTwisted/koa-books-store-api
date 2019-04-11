const Author = require('@models/author');

module.exports = {
    async index(ctx) {
        const { offset, search } = ctx.request.query;
        const searchClause = search ? { name: new RegExp(search, 'i') } : {};
        const offsetClause = offset ? { skip: Number(offset) } : {};
        const authors = await Author.find({ ...searchClause }, {}, { limit: 50, ...offsetClause });

        ctx.render({ data: { authors } });
    },
};
