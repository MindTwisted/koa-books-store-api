const faker = require('faker');
const supertest = require('supertest');
const mongoose = require('mongoose');
const makeConnection = require('@database/connection');
const Author = require('@models/author');
const Book = require('@models/book');
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
        const res = await server.get(`${AUTHORS_URL}?search=${encodeURIComponent(search)}`);

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

describe(`PUT ${AUTHORS_URL}/:id`, () => {
    test('admin user can update author with unique name', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const updateName = faker.random.alphaNumeric(10);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const author = (await server
            .post(`${AUTHORS_URL}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${token}`)).body.data.author;
        const res = await server
            .put(`${AUTHORS_URL}/${author._id}`)
            .send({
                name: updateName,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('author');
        expect(res.body.data.author.name).toEqual(updateName);

        done();
    });

    test('admin user can update author with the same name', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const author = (await server
            .post(`${AUTHORS_URL}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${token}`)).body.data.author;
        const res = await server
            .put(`${AUTHORS_URL}/${author._id}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('author');
        expect(res.body.data.author.name).toEqual(initialName);

        done();
    });

    test('unauthorized can not update author', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const author = (await server
            .post(`${AUTHORS_URL}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${token}`)).body.data.author;
        const res = await server.put(`${AUTHORS_URL}/${author._id}`).send({
            name: initialName,
        });

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('not admin user can not update author', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const adminToken = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const author = (await server
            .post(`${AUTHORS_URL}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${adminToken}`)).body.data.author;
        const userToken = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .put(`${AUTHORS_URL}/${author._id}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toEqual(403);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('admin user can not update author with empty name', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const updateName = '';
        const adminToken = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const author = (await server
            .post(`${AUTHORS_URL}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${adminToken}`)).body.data.author;
        const res = await server
            .put(`${AUTHORS_URL}/${author._id}`)
            .send({
                name: updateName,
            })
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('name');

        done();
    });

    test('admin user can not update author with name shorter than 6 chars', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const updateName = faker.random.alphaNumeric(5);
        const adminToken = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const author = (await server
            .post(`${AUTHORS_URL}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${adminToken}`)).body.data.author;
        const res = await server
            .put(`${AUTHORS_URL}/${author._id}`)
            .send({
                name: updateName,
            })
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('name');

        done();
    });

    test('admin user can not update author with duplicate name', async done => {
        const initialName1 = faker.random.alphaNumeric(6);
        const initialName2 = faker.random.alphaNumeric(6);
        const adminToken = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;

        await server
            .post(`${AUTHORS_URL}`)
            .send({
                name: initialName1,
            })
            .set('Authorization', `Bearer ${adminToken}`);

        const author = (await server
            .post(`${AUTHORS_URL}`)
            .send({
                name: initialName2,
            })
            .set('Authorization', `Bearer ${adminToken}`)).body.data.author;
        const res = await server
            .put(`${AUTHORS_URL}/${author._id}`)
            .send({
                name: initialName1,
            })
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('name');

        done();
    });

    test('admin user can not update author by nonexistent mongodb id', async done => {
        const id = mongoose.Types.ObjectId();
        const updateName = faker.random.alphaNumeric(6);
        const adminToken = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${AUTHORS_URL}/${id}`)
            .send({
                name: updateName,
            })
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('user can not update author by invalid id', async done => {
        const id = faker.random.alphaNumeric(10);
        const updateName = faker.random.alphaNumeric(6);
        const adminToken = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${AUTHORS_URL}/${id}`)
            .send({
                name: updateName,
            })
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });
});

describe(`DELETE ${AUTHORS_URL}/:id`, () => {
    test('admin user can delete author by valid id', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const author = (await server
            .post(`${AUTHORS_URL}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${token}`)).body.data.author;
        const res = await server.delete(`${AUTHORS_URL}/${author._id}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');

        done();
    });

    test('admin user can delete author and this will cause removing author-book relationship', async done => {
        const authors = await Author.create(
            { name: faker.random.alphaNumeric(10) },
            { name: faker.random.alphaNumeric(10) },
        );
        const authorIds = authors.map(a => a._id);
        const book = await Book.create({
            title: faker.random.alphaNumeric(10),
            description: faker.random.alphaNumeric(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
            authors: authorIds,
        });

        expect(JSON.parse(JSON.stringify(book.authors))).toEqual(JSON.parse(JSON.stringify(authorIds)));

        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const deleteId = authors[0]._id;
        const res = await server.delete(`${AUTHORS_URL}/${deleteId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');

        const updatedBook = await Book.findById(book._id);

        expect(JSON.parse(JSON.stringify(updatedBook.authors))).toEqual(JSON.parse(JSON.stringify(authorIds.slice(1))));

        done();
    });

    test('unauthorized can not delete author', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const author = (await server
            .post(`${AUTHORS_URL}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${token}`)).body.data.author;
        const res = await server.delete(`${AUTHORS_URL}/${author._id}`);

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('not admin user can not delete author', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const adminToken = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const author = (await server
            .post(`${AUTHORS_URL}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${adminToken}`)).body.data.author;
        const userToken = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server.delete(`${AUTHORS_URL}/${author._id}`).set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toEqual(403);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('admin user can not delete author by nonexistent mongodb id', async done => {
        const id = mongoose.Types.ObjectId();
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server.delete(`${AUTHORS_URL}/${id}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('admin user can not delete author by invalid id', async done => {
        const id = faker.random.alphaNumeric(10);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server.delete(`${AUTHORS_URL}/${id}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });
});
