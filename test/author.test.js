const faker = require('faker');
const supertest = require('supertest');
const mongoose = require('mongoose');
const makeConnection = require('@database/connection');
const Author = require('@models/author');
const app = require('@root/app/app');
const server = supertest.agent(app.callback());
const AUTH_URL = '/api/auth';
const AUTHORS_URL = '/api/authors';
const ADMIN_USER = { email: 'john@example.com', password: 'secret' };
const USER = { email: 'smith@example.com', password: 'secret' };

beforeAll(async () => {
    await makeConnection();
});

describe(`GET ${AUTHORS_URL}`, () => {
    test('user can get all authors', async done => {
        const limit = 50;
        const authors = await Author.find({}, {}, { limit })
            .lean()
            .select('name');
        const res = await server.get(`${AUTHORS_URL}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('authors');
        expect(res.body.data.authors).toHaveLength(limit);
        expect(res.body.data.authors).toEqual(JSON.parse(JSON.stringify(authors)));

        done();
    });

    test('user can get all authors filtered by direct name', async done => {
        const name = faker.name.findName() + ' ' + faker.name.lastName();

        await Author.create({ name });

        const authors = await Author.find({ name })
            .lean()
            .select('name');
        const res = await server.get(`${AUTHORS_URL}?search=${name}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('authors');
        expect(res.body.data.authors).toHaveLength(1);
        expect(res.body.data.authors).toEqual(JSON.parse(JSON.stringify(authors)));

        done();
    });

    test('user can get all authors filtered by name substring', async done => {
        const name = faker.name.findName() + ' ' + faker.name.lastName();
        const search = name.substring(1, 5);

        await Author.create({ name });

        const authors = await Author.find({ name: new RegExp(search, 'i') })
            .lean()
            .select('name');
        const res = await server.get(`${AUTHORS_URL}?search=${search}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('authors');
        expect(res.body.data.authors).toHaveLength(authors.length);
        expect(res.body.data.authors).toEqual(JSON.parse(JSON.stringify(authors)));

        done();
    });

    test('user can get all authors shifted by offset', async done => {
        const limit = 50;
        const offset = 50;
        const authors = await Author.find({}, {}, { limit, skip: offset })
            .lean()
            .select('name');
        const res = await server.get(`${AUTHORS_URL}?offset=${offset}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('authors');
        expect(res.body.data.authors).toHaveLength(limit);
        expect(res.body.data.authors).toEqual(JSON.parse(JSON.stringify(authors)));

        done();
    });
});

describe(`GET ${AUTHORS_URL}/:id`, () => {
    test('user can get author by valid id', async done => {
        const name = faker.name.findName() + ' ' + faker.name.lastName();
        const author = await Author.create({ name });
        const res = await server.get(`${AUTHORS_URL}/${author._id}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('author');
        expect(res.body.data.author).toEqual(JSON.parse(JSON.stringify(author)));

        done();
    });

    test('user can not get author by nonexistent mongodb id', async done => {
        const id = mongoose.Types.ObjectId();
        const res = await server.get(`${AUTHORS_URL}/${id}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('user can not get author by invalid id', async done => {
        const id = faker.random.alphaNumeric(10);
        const res = await server.get(`${AUTHORS_URL}/${id}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });
});

describe(`POST ${AUTHORS_URL}`, () => {
    test('admin user can create new author with valid name', async done => {
        const authorName = faker.random.alphaNumeric(6);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${AUTHORS_URL}`)
            .send({
                name: authorName,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('author');
        expect(res.body.data.author.name).toEqual(authorName);

        done();
    });

    test('unauthorized can not create new author', async done => {
        const authorName = faker.random.alphaNumeric(6);
        const res = await server.post(`${AUTHORS_URL}`).send({
            name: authorName,
        });

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('not admin user can not create new author', async done => {
        const authorName = faker.random.alphaNumeric(6);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .post(`${AUTHORS_URL}`)
            .send({
                name: authorName,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(403);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('admin user can not create author with empty name', async done => {
        const authorName = '';
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${AUTHORS_URL}`)
            .send({
                name: authorName,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('name');

        done();
    });

    test('admin user can not create author with name shorter than 6 chars', async done => {
        const authorName = faker.random.alphaNumeric(5);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${AUTHORS_URL}`)
            .send({
                name: authorName,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('name');

        done();
    });

    test('admin user can not create author with duplicate name', async done => {
        const authorName = faker.random.alphaNumeric(6);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;

        await server
            .post(`${AUTHORS_URL}`)
            .send({
                name: authorName,
            })
            .set('Authorization', `Bearer ${token}`);

        const res = await server
            .post(`${AUTHORS_URL}`)
            .send({
                name: authorName,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('name');

        done();
    });
});
