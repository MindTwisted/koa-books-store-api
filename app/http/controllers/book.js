const Book = require('@models/book');
const NotFoundError = require('@errors/NotFoundError');
const _ = require('lodash');

module.exports = {
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
            .lean()
            .select('title description price discount');

        ctx.render({ data: { books } });
    },
    async show(ctx) {
        const id = ctx.params.id;
        const book = await Book.findById(id)
            .populate('authors genres', 'name')
            .lean()
            .select('title description price discount');

        if (!book) {
            throw new NotFoundError('Not found.');
        }

        ctx.render({ data: { book } });
    },
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

        return ctx.render({ text: `Book '${book.title}' was successfully created.`, data: { book: populatedBook } });
    },
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

        return ctx.render({ text: `Book '${book.title}' was successfully updated.`, data: { book } });
    },
    async destroy(ctx) {},
};
