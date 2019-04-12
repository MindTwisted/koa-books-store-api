const Author = require('@models/author');
const NotFoundError = require('@errors/NotFoundError');

module.exports = {
    async index(ctx) {
        const { offset, search } = ctx.request.query;
        const searchClause = search ? { name: new RegExp(search, 'i') } : {};
        const offsetClause = offset ? { skip: Number(offset) } : {};
        const authors = await Author.find({ ...searchClause }, {}, { limit: 50, ...offsetClause })
            .lean()
            .select('name');

        ctx.render({ data: { authors } });
    },
    async show(ctx) {
        const id = ctx.params.id;
        const author = await Author.findById(id)
            .lean()
            .select('name');

        if (!author) {
            throw new NotFoundError('Not found.');
        }

        ctx.render({ data: { author } });
    },
    async store(ctx) {
        const { name } = ctx.request.body;
        const author = await Author.create({ name });

        return ctx.render({ text: `Author '${author.name}' was successfully created.`, data: { author } });
    },
};
