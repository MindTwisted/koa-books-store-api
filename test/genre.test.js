const faker = require('faker');
const supertest = require('supertest');
const mongoose = require('mongoose');
const makeConnection = require('@database/connection');
const Genre = require('@models/genre');
const Book = require('@models/book');
const app = require('@root/app/app');
const server = supertest.agent(app.callback());
const AUTH_URL = '/api/auth';
const GENRES_URL = '/api/genres';
const ADMIN_USER = { email: 'john@example.com', password: 'secret' };
const USER = { email: 'smith@example.com', password: 'secret' };

beforeAll(async () => {
    await makeConnection();
});

describe(`GET ${GENRES_URL}`, () => {
    test('user can get all genres', async done => {
        const limit = 50;
        const genres = await Genre.find({}, {}, { limit })
            .lean()
            .select('name');
        const res = await server.get(`${GENRES_URL}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('genres');
        expect(res.body.data.genres).toHaveLength(limit);
        expect(res.body.data.genres).toEqual(JSON.parse(JSON.stringify(genres)));

        done();
    });

    test('user can get all genres filtered by direct name', async done => {
        const name = faker.name.findName() + ' ' + faker.name.lastName();

        await Genre.create({ name });

        const genres = await Genre.find({ name })
            .lean()
            .select('name');
        const res = await server.get(`${GENRES_URL}?search=${name}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('genres');
        expect(res.body.data.genres).toHaveLength(1);
        expect(res.body.data.genres).toEqual(JSON.parse(JSON.stringify(genres)));

        done();
    });

    test('user can get all genres filtered by name substring', async done => {
        const name = faker.name.findName() + ' ' + faker.name.lastName();
        const search = name.substring(1, 5);

        await Genre.create({ name });

        const genres = await Genre.find({ name: new RegExp(search, 'i') })
            .lean()
            .select('name');
        const res = await server.get(`${GENRES_URL}?search=${encodeURIComponent(search)}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('genres');
        expect(res.body.data.genres).toHaveLength(genres.length);
        expect(res.body.data.genres).toEqual(JSON.parse(JSON.stringify(genres)));

        done();
    });

    test('user can get all genres shifted by offset', async done => {
        const limit = 50;
        const offset = 50;
        const genres = await Genre.find({}, {}, { limit, skip: offset })
            .lean()
            .select('name');
        const res = await server.get(`${GENRES_URL}?offset=${offset}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('genres');
        expect(res.body.data.genres).toHaveLength(limit);
        expect(res.body.data.genres).toEqual(JSON.parse(JSON.stringify(genres)));

        done();
    });
});

describe(`GET ${GENRES_URL}/:id`, () => {
    test('user can get genre by valid id', async done => {
        const name = faker.name.findName() + ' ' + faker.name.lastName();
        const genre = await Genre.create({ name });
        const res = await server.get(`${GENRES_URL}/${genre._id}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('genre');
        expect(res.body.data.genre).toEqual(JSON.parse(JSON.stringify(genre)));

        done();
    });

    test('user can not get genre by nonexistent mongodb id', async done => {
        const id = mongoose.Types.ObjectId();
        const res = await server.get(`${GENRES_URL}/${id}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('user can not get genre by invalid id', async done => {
        const id = faker.random.alphaNumeric(10);
        const res = await server.get(`${GENRES_URL}/${id}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });
});

describe(`POST ${GENRES_URL}`, () => {
    test('admin user can create new genre with valid name', async done => {
        const genreName = faker.random.alphaNumeric(6);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${GENRES_URL}`)
            .send({
                name: genreName,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('genre');
        expect(res.body.data.genre.name).toEqual(genreName);

        done();
    });

    test('unauthorized can not create new genre', async done => {
        const genreName = faker.random.alphaNumeric(6);
        const res = await server.post(`${GENRES_URL}`).send({
            name: genreName,
        });

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('not admin user can not create new genre', async done => {
        const genreName = faker.random.alphaNumeric(6);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .post(`${GENRES_URL}`)
            .send({
                name: genreName,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(403);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('admin user can not create genre with empty name', async done => {
        const genreName = '';
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${GENRES_URL}`)
            .send({
                name: genreName,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('name');

        done();
    });

    test('admin user can not create genre with name shorter than 6 chars', async done => {
        const genreName = faker.random.alphaNumeric(5);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${GENRES_URL}`)
            .send({
                name: genreName,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('name');

        done();
    });

    test('admin user can not create genre with duplicate name', async done => {
        const genreName = faker.random.alphaNumeric(6);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;

        await server
            .post(`${GENRES_URL}`)
            .send({
                name: genreName,
            })
            .set('Authorization', `Bearer ${token}`);

        const res = await server
            .post(`${GENRES_URL}`)
            .send({
                name: genreName,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('name');

        done();
    });
});

describe(`PUT ${GENRES_URL}/:id`, () => {
    test('admin user can update genre with unique name', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const updateName = faker.random.alphaNumeric(10);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const genre = (await server
            .post(`${GENRES_URL}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${token}`)).body.data.genre;
        const res = await server
            .put(`${GENRES_URL}/${genre._id}`)
            .send({
                name: updateName,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('genre');
        expect(res.body.data.genre.name).toEqual(updateName);

        done();
    });

    test('admin user can update genre with the same name', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const genre = (await server
            .post(`${GENRES_URL}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${token}`)).body.data.genre;
        const res = await server
            .put(`${GENRES_URL}/${genre._id}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('genre');
        expect(res.body.data.genre.name).toEqual(initialName);

        done();
    });

    test('unauthorized can not update genre', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const genre = (await server
            .post(`${GENRES_URL}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${token}`)).body.data.genre;
        const res = await server.put(`${GENRES_URL}/${genre._id}`).send({
            name: initialName,
        });

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('not admin user can not update genre', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const adminToken = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const genre = (await server
            .post(`${GENRES_URL}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${adminToken}`)).body.data.genre;
        const userToken = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .put(`${GENRES_URL}/${genre._id}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toEqual(403);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('admin user can not update genre with empty name', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const updateName = '';
        const adminToken = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const genre = (await server
            .post(`${GENRES_URL}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${adminToken}`)).body.data.genre;
        const res = await server
            .put(`${GENRES_URL}/${genre._id}`)
            .send({
                name: updateName,
            })
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('name');

        done();
    });

    test('admin user can not update genre with name shorter than 6 chars', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const updateName = faker.random.alphaNumeric(5);
        const adminToken = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const genre = (await server
            .post(`${GENRES_URL}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${adminToken}`)).body.data.genre;
        const res = await server
            .put(`${GENRES_URL}/${genre._id}`)
            .send({
                name: updateName,
            })
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('name');

        done();
    });

    test('admin user can not update genre with duplicate name', async done => {
        const initialName1 = faker.random.alphaNumeric(6);
        const initialName2 = faker.random.alphaNumeric(6);
        const adminToken = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;

        await server
            .post(`${GENRES_URL}`)
            .send({
                name: initialName1,
            })
            .set('Authorization', `Bearer ${adminToken}`);

        const genre = (await server
            .post(`${GENRES_URL}`)
            .send({
                name: initialName2,
            })
            .set('Authorization', `Bearer ${adminToken}`)).body.data.genre;
        const res = await server
            .put(`${GENRES_URL}/${genre._id}`)
            .send({
                name: initialName1,
            })
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('name');

        done();
    });

    test('admin user can not update genre by nonexistent mongodb id', async done => {
        const id = mongoose.Types.ObjectId();
        const updateName = faker.random.alphaNumeric(6);
        const adminToken = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${GENRES_URL}/${id}`)
            .send({
                name: updateName,
            })
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('user can not update genre by invalid id', async done => {
        const id = faker.random.alphaNumeric(10);
        const updateName = faker.random.alphaNumeric(6);
        const adminToken = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${GENRES_URL}/${id}`)
            .send({
                name: updateName,
            })
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });
});

describe(`DELETE ${GENRES_URL}/:id`, () => {
    test('admin user can delete genre by valid id', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const genre = (await server
            .post(`${GENRES_URL}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${token}`)).body.data.genre;
        const res = await server.delete(`${GENRES_URL}/${genre._id}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');

        done();
    });

    test('admin user can delete genre and this will cause removing genre-book relationship', async done => {
        const genres = await Genre.create(
            { name: faker.random.alphaNumeric(10) },
            { name: faker.random.alphaNumeric(10) },
        );
        const genreIds = genres.map(a => a._id);
        const book = await Book.create({
            title: faker.random.alphaNumeric(10),
            description: faker.random.alphaNumeric(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
            genres: genreIds,
        });

        expect(JSON.parse(JSON.stringify(book.genres))).toEqual(JSON.parse(JSON.stringify(genreIds)));

        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const deleteId = genres[0]._id;
        const res = await server.delete(`${GENRES_URL}/${deleteId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');

        const updatedBook = await Book.findById(book._id);

        expect(JSON.parse(JSON.stringify(updatedBook.genres))).toEqual(JSON.parse(JSON.stringify(genreIds.slice(1))));

        done();
    });

    test('unauthorized can not delete genre', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const genre = (await server
            .post(`${GENRES_URL}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${token}`)).body.data.genre;
        const res = await server.delete(`${GENRES_URL}/${genre._id}`);

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('not admin user can not delete genre', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const adminToken = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const genre = (await server
            .post(`${GENRES_URL}`)
            .send({
                name: initialName,
            })
            .set('Authorization', `Bearer ${adminToken}`)).body.data.genre;
        const userToken = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server.delete(`${GENRES_URL}/${genre._id}`).set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toEqual(403);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('admin user can not delete genre by nonexistent mongodb id', async done => {
        const id = mongoose.Types.ObjectId();
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server.delete(`${GENRES_URL}/${id}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('admin user can not delete genre by invalid id', async done => {
        const id = faker.random.alphaNumeric(10);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server.delete(`${GENRES_URL}/${id}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });
});
