const faker = require('faker');
const supertest = require('supertest');
const mongoose = require('mongoose');
const makeConnection = require('@database/connection');
const Book = require('@models/book');
const Author = require('@models/author');
const Genre = require('@models/genre');
const app = require('@root/app/app');
const server = supertest.agent(app.callback());
const AUTH_URL = '/api/auth';
const BOOKS_URL = '/api/books';
const ADMIN_USER = { email: 'john@example.com', password: 'secret' };
const USER = { email: 'smith@example.com', password: 'secret' };

beforeAll(async () => {
    await makeConnection();
});

describe(`GET ${BOOKS_URL}`, () => {
    test('user can get all books', async done => {
        const limit = 50;
        const books = await Book.find({}, {}, { limit })
            .populate('authors genres', 'name')
            .lean()
            .select('title description price discount');
        const res = await server.get(`${BOOKS_URL}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('books');
        expect(res.body.data.books).toHaveLength(limit);
        expect(res.body.data.books).toEqual(JSON.parse(JSON.stringify(books)));

        done();
    });

    test('user can get books shifted by offset', async done => {
        const offset = 50;
        const limit = 50;
        const books = await Book.find({}, {}, { limit, skip: offset })
            .populate('authors genres', 'name')
            .lean()
            .select('title description price discount');
        const res = await server.get(`${BOOKS_URL}?offset=${offset}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('books');
        expect(res.body.data.books).toHaveLength(limit);
        expect(res.body.data.books).toEqual(JSON.parse(JSON.stringify(books)));

        done();
    });

    test('user can get books filtered by title substring', async done => {
        const title = faker.lorem.words(3);
        const search = title.substring(1, 5);

        await Book.create({
            title,
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });

        const books = await Book.find({ title: new RegExp(search, 'i') }, {}, { limit: 50 })
            .populate('authors genres', 'name')
            .lean()
            .select('title description price discount');
        const res = await server.get(`${BOOKS_URL}?search=${encodeURIComponent(search)}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('books');
        expect(res.body.data.books).toHaveLength(books.length);
        expect(res.body.data.books).toEqual(JSON.parse(JSON.stringify(books)));

        done();
    });

    test('user can get books filtered by authors ids', async done => {
        const authors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const ids = authors.map(a => a._id);
        const books = await Book.find({ authors: { $in: ids } }, {}, { limit: 50 })
            .populate('authors genres', 'name')
            .lean()
            .select('title description price discount');
        const res = await server.get(`${BOOKS_URL}?authors=${ids.join(',')}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('books');
        expect(res.body.data.books).toHaveLength(books.length);
        expect(res.body.data.books).toEqual(JSON.parse(JSON.stringify(books)));

        done();
    });

    test('user can get books filtered by genres ids', async done => {
        const genres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const ids = genres.map(a => a._id);
        const books = await Book.find({ genres: { $in: ids } }, {}, { limit: 50 })
            .populate('authors genres', 'name')
            .lean()
            .select('title description price discount');
        const res = await server.get(`${BOOKS_URL}?genres=${ids.join(',')}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('books');
        expect(res.body.data.books).toHaveLength(books.length);
        expect(res.body.data.books).toEqual(JSON.parse(JSON.stringify(books)));

        done();
    });
});

describe(`GET ${BOOKS_URL}/:id`, () => {
    test('user can get book by valid id', async done => {
        const authors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const genres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const authorIds = authors.map(a => a._id);
        const genreIds = genres.map(a => a._id);
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
            authors: authorIds,
            genres: genreIds,
        });
        const fetchedBook = await Book.findById(book._id)
            .populate('authors genres', 'name')
            .lean()
            .select('title description price discount');
        const res = await server.get(`${BOOKS_URL}/${book._id}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('book');
        expect(res.body.data.book).toEqual(JSON.parse(JSON.stringify(fetchedBook)));

        done();
    });

    test('user can not get book by nonexistent mongodb id', async done => {
        const id = mongoose.Types.ObjectId();
        const res = await server.get(`${BOOKS_URL}/${id}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('user can not get book by invalid id', async done => {
        const id = faker.random.alphaNumeric(10);
        const res = await server.get(`${BOOKS_URL}/${id}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });
});
