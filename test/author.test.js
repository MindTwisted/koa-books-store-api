require('@database/connection');

const faker = require('faker');
const supertest = require('supertest');
const Author = require('@models/author');
const app = require('@root/app/app');
const server = supertest.agent(app.callback());
const AUTHORS_URL = '/api/authors';

describe(`GET ${AUTHORS_URL}`, () => {
    test('user can get all authors', async done => {
        const limit = 50;
        const authors = await Author.find({}, {}, { limit });
        const res = await server.get(`${AUTHORS_URL}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('authors');
        expect(res.body.data.authors).toHaveLength(limit);
        expect(res.body.data.authors).toEqual(authors.map(author => author.toJSON()));

        done();
    });

    test('user can get all authors filtered by direct name', async done => {
        const name = faker.name.findName() + ' ' + faker.name.lastName();
        const author = await Author.create({ name });
        const res = await server.get(`${AUTHORS_URL}?search=${author.name}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('authors');
        expect(res.body.data.authors).toHaveLength(1);
        expect(res.body.data.authors[0]).toEqual(author.toJSON());

        done();
    });

    test('user can get all authors filtered by name substring', async done => {
        const name = faker.name.findName() + ' ' + faker.name.lastName();
        const search = name.substring(1, 5);

        await Author.create({ name });

        const authors = await Author.find({ name: new RegExp(search, 'i') });
        const res = await server.get(`${AUTHORS_URL}?search=${search}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('authors');
        expect(res.body.data.authors).toHaveLength(authors.length);
        expect(res.body.data.authors).toEqual(authors.map(author => author.toJSON()));

        done();
    });

    test('user can get all authors shifted by offset', async done => {
        const limit = 50;
        const offset = 50;
        const authors = await Author.find({}, {}, { limit, skip: offset });
        const res = await server.get(`${AUTHORS_URL}?offset=${offset}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('authors');
        expect(res.body.data.authors).toHaveLength(limit);
        expect(res.body.data.authors).toEqual(authors.map(author => author.toJSON()));

        done();
    });
});
