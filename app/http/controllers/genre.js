const Genre = require('@models/genre');
const Book = require('@models/book');
const NotFoundError = require('@errors/NotFoundError');

module.exports = {
    /**
     * Get all genres
     *
     * @param {Context} ctx
     */
    async index(ctx) {
        const { offset, search } = ctx.request.query;
        const searchClause = search ? { name: new RegExp(search, 'i') } : {};
        const offsetClause = offset ? { skip: Number(offset) } : {};
        const genres = await Genre.find({ ...searchClause }, {}, { limit: 50, ...offsetClause })
            .lean()
            .select('name');

        ctx.render({ data: { genres } });
    },
    /**
     * Get genre by id
     *
     * @param {Context} ctx
     */
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
    /**
     * Get books by genre id
     *
     * @param {Context} ctx
     */
    async showBooks(ctx) {
        const id = ctx.params.id;
        const { offset } = ctx.request.query;
        const offsetClause = offset ? { skip: Number(offset) } : {};
        const books = await Book.find({ genres: { $in: [id] } }, {}, { limit: 50, ...offsetClause })
            .populate('authors genres', 'name')
            .lean({ virtuals: true })
            .select('title description price discount image');

        ctx.render({ data: { books } });
    },
    /**
     * Create new genre
     *
     * @param {Context} ctx
     */
    async store(ctx) {
        const { name } = ctx.request.body;
        const genre = await Genre.create({ name });

        ctx.render({ text: `Genre '${genre.name}' was successfully created.`, data: { genre } });
    },
    /**
     * Update genre by id
     *
     * @param {Context} ctx
     */
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

        ctx.render({ text: `Genre '${genre.name}' was successfully updated.`, data: { genre } });
    },
    /**
     * Delete genre by id
     *
     * @param {Context} ctx
     */
    async destroy(ctx) {
        const id = ctx.params.id;
        const genre = await Genre.findOneAndRemove({ _id: id });

        if (!genre) {
            throw new NotFoundError('Not found.');
        }

        ctx.render({ text: `Genre '${genre.name}' was successfully deleted.` });
    },
};
