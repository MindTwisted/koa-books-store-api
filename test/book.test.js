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
            .select('title description price discount image');
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
            .select('title description price discount image');
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
            .select('title description price discount image');
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
            .select('title description price discount image');
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
            .select('title description price discount image');
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
            .select('title description price discount image');
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

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');

        done();
    });
});

describe(`POST ${BOOKS_URL}`, () => {
    test('admin user can create new book with valid data provided', async done => {
        const title = faker.random.alphaNumeric(6);
        const description = faker.random.alphaNumeric(20);
        const price = faker.random.number({ min: 30, max: 100 });
        const discount = faker.random.number({ min: 0, max: 50 });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}`)
            .send({ title, description, price, discount })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('book');
        expect(res.body.data.book.title).toEqual(title);
        expect(res.body.data.book.description).toEqual(description);
        expect(res.body.data.book.price).toEqual(price);
        expect(res.body.data.book.discount).toEqual(discount);
        expect(res.body.data.book.authors).toHaveLength(0);
        expect(res.body.data.book.genres).toHaveLength(0);

        done();
    });

    test('admin user can create new book with authors, genres and valid data provided', async done => {
        const title = faker.random.alphaNumeric(6);
        const description = faker.random.alphaNumeric(20);
        const price = faker.random.number({ min: 30, max: 100 });
        const discount = faker.random.number({ min: 0, max: 50 });
        const authors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const genres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}`)
            .send({
                title,
                description,
                price,
                discount,
                authors: authors.map(a => a._id),
                genres: genres.map(a => a._id),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('book');
        expect(res.body.data.book.title).toEqual(title);
        expect(res.body.data.book.description).toEqual(description);
        expect(res.body.data.book.price).toEqual(price);
        expect(res.body.data.book.discount).toEqual(discount);
        expect(res.body.data.book.authors).toEqual(JSON.parse(JSON.stringify(authors)));
        expect(res.body.data.book.genres).toEqual(JSON.parse(JSON.stringify(genres)));

        done();
    });

    test('unauthorized can not create new book', async done => {
        const title = faker.random.alphaNumeric(6);
        const description = faker.random.alphaNumeric(20);
        const price = faker.random.number({ min: 30, max: 100 });
        const discount = faker.random.number({ min: 0, max: 50 });
        const res = await server.post(`${BOOKS_URL}`).send({ title, description, price, discount });

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('not admin user can not create new book', async done => {
        const title = faker.random.alphaNumeric(6);
        const description = faker.random.alphaNumeric(20);
        const price = faker.random.number({ min: 30, max: 100 });
        const discount = faker.random.number({ min: 0, max: 50 });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}`)
            .send({ title, description, price, discount })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(403);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('admin user can not create new book with empty title', async done => {
        const title = '';
        const description = faker.random.alphaNumeric(20);
        const price = faker.random.number({ min: 30, max: 100 });
        const discount = faker.random.number({ min: 0, max: 50 });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}`)
            .send({ title, description, price, discount })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not create new book with title shorter than 6 chars', async done => {
        const title = faker.random.alphaNumeric(5);
        const description = faker.random.alphaNumeric(20);
        const price = faker.random.number({ min: 30, max: 100 });
        const discount = faker.random.number({ min: 0, max: 50 });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}`)
            .send({ title, description, price, discount })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not create new book with empty description', async done => {
        const title = faker.random.alphaNumeric(6);
        const description = '';
        const price = faker.random.number({ min: 30, max: 100 });
        const discount = faker.random.number({ min: 0, max: 50 });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}`)
            .send({ title, description, price, discount })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not create new book with description shorter than 20 chars', async done => {
        const title = faker.random.alphaNumeric(6);
        const description = faker.random.alphaNumeric(19);
        const price = faker.random.number({ min: 30, max: 100 });
        const discount = faker.random.number({ min: 0, max: 50 });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}`)
            .send({ title, description, price, discount })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not create new book with empty price', async done => {
        const title = faker.random.alphaNumeric(6);
        const description = faker.random.alphaNumeric(20);
        const price = '';
        const discount = faker.random.number({ min: 0, max: 50 });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}`)
            .send({ title, description, price, discount })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not create new book with price less than 0', async done => {
        const title = faker.random.alphaNumeric(6);
        const description = faker.random.alphaNumeric(20);
        const price = -1;
        const discount = faker.random.number({ min: 0, max: 50 });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}`)
            .send({ title, description, price, discount })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not create new book with price not numeric', async done => {
        const title = faker.random.alphaNumeric(6);
        const description = faker.random.alphaNumeric(20);
        const price = faker.random.alphaNumeric(10);
        const discount = faker.random.number({ min: 0, max: 50 });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}`)
            .send({ title, description, price, discount })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not create new book with empty discount', async done => {
        const title = faker.random.alphaNumeric(6);
        const description = faker.random.alphaNumeric(20);
        const price = faker.random.number({ min: 30, max: 100 });
        const discount = '';
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}`)
            .send({ title, description, price, discount })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not create new book with discount less than 0', async done => {
        const title = faker.random.alphaNumeric(6);
        const description = faker.random.alphaNumeric(20);
        const price = faker.random.number({ min: 30, max: 100 });
        const discount = -1;
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}`)
            .send({ title, description, price, discount })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not create new book with discount greater than 50', async done => {
        const title = faker.random.alphaNumeric(6);
        const description = faker.random.alphaNumeric(20);
        const price = faker.random.number({ min: 30, max: 100 });
        const discount = 51;
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}`)
            .send({ title, description, price, discount })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not create new book with discount not numeric', async done => {
        const title = faker.random.alphaNumeric(6);
        const description = faker.random.alphaNumeric(20);
        const price = faker.random.number({ min: 30, max: 100 });
        const discount = faker.random.alphaNumeric(10);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}`)
            .send({ title, description, price, discount })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not create new book with authors and genres contains not existed mongodb ids', async done => {
        const title = faker.random.alphaNumeric(6);
        const description = faker.random.alphaNumeric(20);
        const price = faker.random.number({ min: 30, max: 100 });
        const discount = faker.random.number({ min: 0, max: 50 });
        const authors = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];
        const genres = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}`)
            .send({ title, description, price, discount, authors, genres })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).toHaveProperty(['authors.0']);
        expect(res.body.data.errors).toHaveProperty(['authors.1']);
        expect(res.body.data.errors).toHaveProperty(['genres.0']);
        expect(res.body.data.errors).toHaveProperty(['genres.1']);

        done();
    });

    test('admin user can not create new book with authors and genres contains not valid mongodb ids', async done => {
        const title = faker.random.alphaNumeric(6);
        const description = faker.random.alphaNumeric(20);
        const price = faker.random.number({ min: 30, max: 100 });
        const discount = faker.random.number({ min: 0, max: 50 });
        const authors = [faker.random.alphaNumeric(10), faker.random.alphaNumeric(10)];
        const genres = [faker.random.alphaNumeric(10), faker.random.alphaNumeric(10)];
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}`)
            .send({ title, description, price, discount, authors, genres })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).toHaveProperty('authors');
        expect(res.body.data.errors).toHaveProperty('genres');

        done();
    });
});

describe(`POST ${BOOKS_URL}/:id/image`, () => {
    test('admin user can update book image with valid image and valid id', async done => {
        const book = (await Book.find({}, {}, { limit: 1 }))[0];
        const filePath = `${__dirname}/testFiles/image.jpg`;
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}/${book._id}/image`)
            .attach('image', filePath)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('book');
        expect(res.body.data.book.image).not.toBeNull();

        done();
    });

    test('admin user can delete book image with valid id and empty request body', async done => {
        const book = (await Book.find({}, {}, { limit: 1 }))[0];
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server.post(`${BOOKS_URL}/${book._id}/image`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('book');
        expect(res.body.data.book.image).toBeNull();

        done();
    });

    test('unauthorized can not update book image with valid id', async done => {
        const book = (await Book.find({}, {}, { limit: 1 }))[0];
        const res = await server.post(`${BOOKS_URL}/${book._id}/image`);

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('not admin user can not update book image with valid id', async done => {
        const book = (await Book.find({}, {}, { limit: 1 }))[0];
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server.post(`${BOOKS_URL}/${book._id}/image`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(403);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('admin user can not update book image with image larger than 5mb and valid id', async done => {
        const book = (await Book.find({}, {}, { limit: 1 }))[0];
        const filePath = `${__dirname}/testFiles/large-image.jpg`;
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}/${book._id}/image`)
            .attach('image', filePath)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('image');

        done();
    });

    test('admin user can not update book image with not-image file and valid id', async done => {
        const book = (await Book.find({}, {}, { limit: 1 }))[0];
        const filePath = `${__dirname}/testFiles/not-image.pdf`;
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}/${book._id}/image`)
            .attach('image', filePath)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('image');

        done();
    });

    test('admin user can not update book image with valid image and non-existent mongodb id', async done => {
        const filePath = `${__dirname}/testFiles/image.jpg`;
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}/${mongoose.Types.ObjectId()}/image`)
            .attach('image', filePath)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('admin user can not update book image with valid image and not valid mongodb id', async done => {
        const filePath = `${__dirname}/testFiles/image.jpg`;
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${BOOKS_URL}/${faker.random.alphaNumeric(10)}/image`)
            .attach('image', filePath)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');

        done();
    });
});

describe(`PUT ${BOOKS_URL}/:id`, () => {
    test('admin user can update book with valid data provided and valid id', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const updatedTitle = faker.random.alphaNumeric(6);
        const updatedDescription = faker.random.alphaNumeric(20);
        const updatedPrice = faker.random.number({ min: 30, max: 100 });
        const updatedDiscount = faker.random.number({ min: 0, max: 50 });
        const updatedAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const updatedGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${initialBook._id}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: updatedAuthors.map(a => a._id),
                genres: updatedGenres.map(a => a._id),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('book');
        expect(res.body.data.book._id).toEqual(initialBook._id.toString());
        expect(res.body.data.book.title).toEqual(updatedTitle);
        expect(res.body.data.book.description).toEqual(updatedDescription);
        expect(res.body.data.book.price).toEqual(updatedPrice);
        expect(res.body.data.book.discount).toEqual(updatedDiscount);
        expect(res.body.data.book.authors).toEqual(JSON.parse(JSON.stringify(updatedAuthors)));
        expect(res.body.data.book.genres).toEqual(JSON.parse(JSON.stringify(updatedGenres)));

        done();
    });

    test('admin user can update book with valid data provided, valid id and empty authors, genres', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const updatedTitle = faker.random.alphaNumeric(6);
        const updatedDescription = faker.random.alphaNumeric(20);
        const updatedPrice = faker.random.number({ min: 30, max: 100 });
        const updatedDiscount = faker.random.number({ min: 0, max: 50 });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${initialBook._id}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: '',
                genres: '',
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('book');
        expect(res.body.data.book._id).toEqual(initialBook._id.toString());
        expect(res.body.data.book.title).toEqual(updatedTitle);
        expect(res.body.data.book.description).toEqual(updatedDescription);
        expect(res.body.data.book.price).toEqual(updatedPrice);
        expect(res.body.data.book.discount).toEqual(updatedDiscount);
        expect(res.body.data.book.authors).toEqual([]);
        expect(res.body.data.book.genres).toEqual([]);

        done();
    });

    test('unauthorized can not update book', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const updatedTitle = faker.random.alphaNumeric(6);
        const updatedDescription = faker.random.alphaNumeric(20);
        const updatedPrice = faker.random.number({ min: 30, max: 100 });
        const updatedDiscount = faker.random.number({ min: 0, max: 50 });
        const res = await server.put(`${BOOKS_URL}/${initialBook._id}`).send({
            title: updatedTitle,
            description: updatedDescription,
            price: updatedPrice,
            discount: updatedDiscount,
            authors: '',
            genres: '',
        });

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('not admin user can not update book', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const updatedTitle = faker.random.alphaNumeric(6);
        const updatedDescription = faker.random.alphaNumeric(20);
        const updatedPrice = faker.random.number({ min: 30, max: 100 });
        const updatedDiscount = faker.random.number({ min: 0, max: 50 });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${initialBook._id}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: '',
                genres: '',
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(403);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('admin user can not update book with empty title', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const updatedTitle = '';
        const updatedDescription = faker.random.alphaNumeric(20);
        const updatedPrice = faker.random.number({ min: 30, max: 100 });
        const updatedDiscount = faker.random.number({ min: 0, max: 50 });
        const updatedAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const updatedGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${initialBook._id}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: updatedAuthors.map(a => a._id),
                genres: updatedGenres.map(a => a._id),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not update book with title shorter than 6 chars', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const updatedTitle = faker.random.alphaNumeric(5);
        const updatedDescription = faker.random.alphaNumeric(20);
        const updatedPrice = faker.random.number({ min: 30, max: 100 });
        const updatedDiscount = faker.random.number({ min: 0, max: 50 });
        const updatedAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const updatedGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${initialBook._id}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: updatedAuthors.map(a => a._id),
                genres: updatedGenres.map(a => a._id),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not update book with duplicate title', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });

        await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });

        const bookToUpdate = (await Book.find({}, {}, { limit: 1 }))[0];
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${bookToUpdate._id}`)
            .send({
                title: initialTitle,
                description: initialDescription,
                price: initialPrice,
                discount: initialDiscount,
                authors: initialAuthors.map(a => a._id),
                genres: initialGenres.map(a => a._id),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not update book with empty description', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const updatedTitle = faker.random.alphaNumeric(6);
        const updatedDescription = '';
        const updatedPrice = faker.random.number({ min: 30, max: 100 });
        const updatedDiscount = faker.random.number({ min: 0, max: 50 });
        const updatedAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const updatedGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${initialBook._id}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: updatedAuthors.map(a => a._id),
                genres: updatedGenres.map(a => a._id),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not update book with description shorter than 19 chars', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const updatedTitle = faker.random.alphaNumeric(6);
        const updatedDescription = faker.random.alphaNumeric(19);
        const updatedPrice = faker.random.number({ min: 30, max: 100 });
        const updatedDiscount = faker.random.number({ min: 0, max: 50 });
        const updatedAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const updatedGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${initialBook._id}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: updatedAuthors.map(a => a._id),
                genres: updatedGenres.map(a => a._id),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not update book with empty price', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const updatedTitle = faker.random.alphaNumeric(6);
        const updatedDescription = faker.random.alphaNumeric(20);
        const updatedPrice = '';
        const updatedDiscount = faker.random.number({ min: 0, max: 50 });
        const updatedAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const updatedGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${initialBook._id}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: updatedAuthors.map(a => a._id),
                genres: updatedGenres.map(a => a._id),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not update book with price less than 0', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const updatedTitle = faker.random.alphaNumeric(6);
        const updatedDescription = faker.random.alphaNumeric(20);
        const updatedPrice = -1;
        const updatedDiscount = faker.random.number({ min: 0, max: 50 });
        const updatedAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const updatedGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${initialBook._id}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: updatedAuthors.map(a => a._id),
                genres: updatedGenres.map(a => a._id),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not update book with price not numeric', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const updatedTitle = faker.random.alphaNumeric(6);
        const updatedDescription = faker.random.alphaNumeric(20);
        const updatedPrice = faker.random.alphaNumeric(10);
        const updatedDiscount = faker.random.number({ min: 0, max: 50 });
        const updatedAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const updatedGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${initialBook._id}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: updatedAuthors.map(a => a._id),
                genres: updatedGenres.map(a => a._id),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not update book with empty discount', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const updatedTitle = faker.random.alphaNumeric(6);
        const updatedDescription = faker.random.alphaNumeric(20);
        const updatedPrice = faker.random.number({ min: 30, max: 100 });
        const updatedDiscount = '';
        const updatedAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const updatedGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${initialBook._id}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: updatedAuthors.map(a => a._id),
                genres: updatedGenres.map(a => a._id),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not update book with discount less than 0', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const updatedTitle = faker.random.alphaNumeric(6);
        const updatedDescription = faker.random.alphaNumeric(20);
        const updatedPrice = faker.random.number({ min: 30, max: 100 });
        const updatedDiscount = -1;
        const updatedAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const updatedGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${initialBook._id}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: updatedAuthors.map(a => a._id),
                genres: updatedGenres.map(a => a._id),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not update book with discount greater than 50', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const updatedTitle = faker.random.alphaNumeric(6);
        const updatedDescription = faker.random.alphaNumeric(20);
        const updatedPrice = faker.random.number({ min: 30, max: 100 });
        const updatedDiscount = 51;
        const updatedAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const updatedGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${initialBook._id}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: updatedAuthors.map(a => a._id),
                genres: updatedGenres.map(a => a._id),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not update book with discount not numeric', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const updatedTitle = faker.random.alphaNumeric(6);
        const updatedDescription = faker.random.alphaNumeric(20);
        const updatedPrice = faker.random.number({ min: 30, max: 100 });
        const updatedDiscount = faker.random.alphaNumeric(10);
        const updatedAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const updatedGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${initialBook._id}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: updatedAuthors.map(a => a._id),
                genres: updatedGenres.map(a => a._id),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not update book with authors and genres contains not existed mongodb ids', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const updatedTitle = faker.random.alphaNumeric(6);
        const updatedDescription = faker.random.alphaNumeric(20);
        const updatedPrice = faker.random.number({ min: 30, max: 100 });
        const updatedDiscount = faker.random.number({ min: 0, max: 50 });
        const updatedAuthors = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];
        const updatedGenres = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${initialBook._id}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: updatedAuthors,
                genres: updatedGenres,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).toHaveProperty(['authors.0']);
        expect(res.body.data.errors).toHaveProperty(['authors.1']);
        expect(res.body.data.errors).toHaveProperty(['genres.0']);
        expect(res.body.data.errors).toHaveProperty(['genres.1']);

        done();
    });

    test('admin user can not update book with authors contains not valid mongodb ids', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const updatedTitle = faker.random.alphaNumeric(6);
        const updatedDescription = faker.random.alphaNumeric(20);
        const updatedPrice = faker.random.number({ min: 30, max: 100 });
        const updatedDiscount = faker.random.number({ min: 0, max: 50 });
        const updatedAuthors = [faker.random.alphaNumeric(10), faker.random.alphaNumeric(10)];
        const updatedGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${initialBook._id}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: updatedAuthors,
                genres: updatedGenres.map(a => a._id),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).toHaveProperty('authors');
        expect(res.body.data.errors).not.toHaveProperty('genres');

        done();
    });

    test('admin user can not update book with genres contains not valid mongodb ids', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const updatedTitle = faker.random.alphaNumeric(6);
        const updatedDescription = faker.random.alphaNumeric(20);
        const updatedPrice = faker.random.number({ min: 30, max: 100 });
        const updatedDiscount = faker.random.number({ min: 0, max: 50 });
        const updatedAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const updatedGenres = [faker.random.alphaNumeric(10), faker.random.alphaNumeric(10)];
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${initialBook._id}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: updatedAuthors.map(a => a._id),
                genres: updatedGenres,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).not.toHaveProperty('title');
        expect(res.body.data.errors).not.toHaveProperty('description');
        expect(res.body.data.errors).not.toHaveProperty('price');
        expect(res.body.data.errors).not.toHaveProperty('discount');
        expect(res.body.data.errors).not.toHaveProperty('authors');
        expect(res.body.data.errors).toHaveProperty('genres');

        done();
    });

    test('admin user can not update book by not existed mongodb id', async done => {
        const updatedTitle = faker.random.alphaNumeric(6);
        const updatedDescription = faker.random.alphaNumeric(20);
        const updatedPrice = faker.random.number({ min: 30, max: 100 });
        const updatedDiscount = faker.random.number({ min: 0, max: 50 });
        const updatedAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const updatedGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${mongoose.Types.ObjectId()}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: updatedAuthors.map(a => a._id),
                genres: updatedGenres.map(a => a._id),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('admin user can not update book by not valid mongodb id', async done => {
        const updatedTitle = faker.random.alphaNumeric(6);
        const updatedDescription = faker.random.alphaNumeric(20);
        const updatedPrice = faker.random.number({ min: 30, max: 100 });
        const updatedDiscount = faker.random.number({ min: 0, max: 50 });
        const updatedAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const updatedGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${BOOKS_URL}/${faker.random.alphaNumeric(10)}`)
            .send({
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                discount: updatedDiscount,
                authors: updatedAuthors.map(a => a._id),
                genres: updatedGenres.map(a => a._id),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');

        done();
    });
});

describe(`DELETE ${BOOKS_URL}/:id`, () => {
    test('admin user can delete book by valid id', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server.delete(`${BOOKS_URL}/${initialBook._id}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');

        done();
    });

    test('unauthorized can not delete book', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const res = await server.delete(`${BOOKS_URL}/${initialBook._id}`);

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('not admin user can not delete book', async done => {
        const initialTitle = faker.random.alphaNumeric(6);
        const initialDescription = faker.random.alphaNumeric(20);
        const initialPrice = faker.random.number({ min: 30, max: 100 });
        const initialDiscount = faker.random.number({ min: 0, max: 50 });
        const initialAuthors = await Author.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialGenres = await Genre.find({}, {}, { limit: faker.random.number({ min: 1, max: 5 }) });
        const initialBook = await Book.create({
            title: initialTitle,
            description: initialDescription,
            price: initialPrice,
            discount: initialDiscount,
            authors: initialAuthors.map(a => a._id),
            genres: initialGenres.map(a => a._id),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server.delete(`${BOOKS_URL}/${initialBook._id}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(403);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('admin user can not delete book by nonexistent mongodb id', async done => {
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .delete(`${BOOKS_URL}/${mongoose.Types.ObjectId()}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('admin user can not delete book by invalid mongodb id', async done => {
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .delete(`${BOOKS_URL}/${faker.random.alphaNumeric(10)}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');

        done();
    });
});
