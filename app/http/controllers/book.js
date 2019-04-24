const _ = require('lodash');
const Book = require('@models/book');
const NotFoundError = require('@errors/NotFoundError');

module.exports = {
    /**
     * Get all books
     *
     * @param {Context} ctx
     */
    async index(ctx) {
        const { offset, search, authors, genres } = ctx.request.query;
        const searchClause = search ? { title: new RegExp(search, 'i') } : {};
        const authorsClause = authors ? { authors: { $in: _.map(_.split(authors, ','), _.trim) } } : {};
        const genresClause = genres ? { genres: { $in: _.map(_.split(genres, ','), _.trim) } } : {};
        const offsetClause = offset ? { skip: Number(offset) } : {};
        const books = await Book.find(
            { ...searchClause, ...authorsClause, ...genresClause },
            {},
            { limit: 50, ...offsetClause },
        )
            .populate('authors genres', 'name')
            .lean({ virtuals: true })
            .select('title description price discount image');

        ctx.render({ data: { books } });
    },
    /**
     * Get book by id
     *
     * @param {Context} ctx
     */
    async show(ctx) {
        const id = ctx.params.id;
        const book = await Book.findById(id)
            .populate('authors genres', 'name')
            .lean({ virtuals: true })
            .select('title description price discount image');

        if (!book) {
            throw new NotFoundError('Not found.');
        }

        ctx.render({ data: { book } });
    },
    /**
     * Create new book
     *
     * @param {Context} ctx
     */
    async store(ctx) {
        const { title, description, price, discount, authors, genres } = ctx.request.body;
        const book = await Book.create({
            title,
            description,
            price,
            discount,
            authors: _.uniq(_.compact(_.map(_.split(authors, ','), _.trim))),
            genres: _.uniq(_.compact(_.map(_.split(genres, ','), _.trim))),
        });
        const populatedBook = await book.populate('authors genres', 'name').execPopulate();

        ctx.render({ text: `Book '${book.title}' was successfully created.`, data: { book: populatedBook } });
    },
    /**
     * Update image for book by id
     *
     * @param {Context} ctx
     */
    async storeImage(ctx) {
        const id = ctx.params.id;
        const image = ctx.request.files && ctx.request.files.image ? ctx.request.files.image : null;
        const book = await Book.findById(id).populate('authors genres', 'name');

        if (!book) {
            throw new NotFoundError('Not found.');
        }

        book.image = image;

        await book.save();

        ctx.render({ text: `Image for book '${book.title}' was successfully updated.`, data: { book } });
    },
    /**
     * Update book by id
     *
     * @param {Context} ctx
     */
    async update(ctx) {
        const id = ctx.params.id;
        const { title, description, price, discount, authors, genres } = ctx.request.body;
        const book = await Book.findOneAndUpdate(
            { _id: id },
            {
                title,
                description,
                price,
                discount,
                authors: _.uniq(_.compact(_.map(_.split(authors, ','), _.trim))),
                genres: _.uniq(_.compact(_.map(_.split(genres, ','), _.trim))),
            },
            { new: true, runValidators: true, context: 'query' },
        ).populate('authors genres', 'name');

        if (!book) {
            throw new NotFoundError('Not found.');
        }

        ctx.render({ text: `Book '${book.title}' was successfully updated.`, data: { book } });
    },
    /**
     * Delete book by id
     *
     * @param {Context} ctx
     */
    async destroy(ctx) {
        const id = ctx.params.id;
        const book = await Book.findOneAndRemove({ _id: id });

        if (!book) {
            throw new NotFoundError('Not found.');
        }

        ctx.render({ text: `Book '${book.title}' was successfully deleted.` });
    },
};
