const Book = require('@models/book');
const NotFoundError = require('@errors/NotFoundError');
const { arrayFromList } = require('@utils/index');

module.exports = {
    async index(ctx) {
        const { offset, search, authors, genres } = ctx.request.query;
        const searchClause = search ? { title: new RegExp(search, 'i') } : {};
        const authorsClause = authors ? { authors: { $in: arrayFromList(authors) } } : {};
        const genresClause = genres ? { genres: { $in: arrayFromList(genres) } } : {};
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
    async show(ctx) {},
    async store(ctx) {},
    async update(ctx) {},
    async destroy(ctx) {},
};
