const Author = require('@models/author');
const Book = require('@models/book');
const NotFoundError = require('@errors/NotFoundError');

module.exports = {
    /**
     * Get all authors
     *
     * @param {Context} ctx
     */
    async index(ctx) {
        const { offset, search } = ctx.request.query;
        const searchClause = search ? { name: new RegExp(search, 'i') } : {};
        const offsetClause = offset ? { skip: Number(offset) } : {};
        const authors = await Author.find({ ...searchClause }, {}, { limit: 50, ...offsetClause })
            .lean()
            .select('name');

        ctx.render({ data: { authors } });
    },
    /**
     * Get author by id
     *
     * @param {Context} ctx
     */
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
    /**
     * Get books by author id
     *
     * @param {Context} ctx
     */
    async showBooks(ctx) {
        const id = ctx.params.id;
        const { offset } = ctx.request.query;
        const offsetClause = offset ? { skip: Number(offset) } : {};
        const books = await Book.find({ authors: { $in: [id] } }, {}, { limit: 50, ...offsetClause })
            .populate('authors genres', 'name')
            .lean({ virtuals: true })
            .select('title description price discount image');

        ctx.render({ data: { books } });
    },
    /**
     * Create new author
     *
     * @param {Context} ctx
     */
    async store(ctx) {
        const { name } = ctx.request.body;
        const author = await Author.create({ name });

        ctx.render({ text: `Author '${author.name}' was successfully created.`, data: { author } });
    },
    /**
     * Update author by id
     *
     * @param {Context} ctx
     */
    async update(ctx) {
        const id = ctx.params.id;
        const { name } = ctx.request.body;
        const author = await Author.findOneAndUpdate(
            { _id: id },
            { name },
            { new: true, runValidators: true, context: 'query' },
        );

        if (!author) {
            throw new NotFoundError('Not found.');
        }

        ctx.render({ text: `Author '${author.name}' was successfully updated.`, data: { author } });
    },
    /**
     * Delete author by id
     *
     * @param {Context} ctx
     */
    async destroy(ctx) {
        const id = ctx.params.id;
        const author = await Author.findOneAndRemove({ _id: id });

        if (!author) {
            throw new NotFoundError('Not found.');
        }

        ctx.render({ text: `Author '${author.name}' was successfully deleted.` });
    },
};
