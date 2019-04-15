const Genre = require('@models/genre');
const NotFoundError = require('@errors/NotFoundError');

module.exports = {
    async index(ctx) {
        const { offset, search } = ctx.request.query;
        const searchClause = search ? { name: new RegExp(search, 'i') } : {};
        const offsetClause = offset ? { skip: Number(offset) } : {};
        const genres = await Genre.find({ ...searchClause }, {}, { limit: 50, ...offsetClause })
            .lean()
            .select('name');

        ctx.render({ data: { genres } });
    },
    async show(ctx) {
        const id = ctx.params.id;
        const genre = await Genre.findById(id)
            .lean()
            .select('name');

        if (!genre) {
            throw new NotFoundError('Not found.');
        }

        ctx.render({ data: { genre } });
    },
    async store(ctx) {
        const { name } = ctx.request.body;
        const genre = await Genre.create({ name });

        return ctx.render({ text: `Genre '${genre.name}' was successfully created.`, data: { genre } });
    },
    async update(ctx) {
        const id = ctx.params.id;
        const { name } = ctx.request.body;
        const genre = await Genre.findOneAndUpdate(
            { _id: id },
            { name },
            { new: true, runValidators: true, context: 'query' },
        );

        if (!genre) {
            throw new NotFoundError('Not found.');
        }

        return ctx.render({ text: `Genre '${genre.name}' was successfully updated.`, data: { genre } });
    },
    async destroy(ctx) {
        const id = ctx.params.id;
        const genre = await Genre.findOneAndRemove({ _id: id });

        if (!genre) {
            throw new NotFoundError('Not found.');
        }

        return ctx.render({ text: `Genre '${genre.name}' was successfully deleted.` });
    },
};
