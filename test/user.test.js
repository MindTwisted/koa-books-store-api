const faker = require('faker');
const supertest = require('supertest');
const mongoose = require('mongoose');
const makeConnection = require('@database/connection');
const User = require('@models/user');
const app = require('@root/app/app');
const server = supertest.agent(app.callback());
const AUTH_URL = '/api/auth';
const USERS_URL = '/api/users';
const ADMIN_USER = { email: 'john@example.com', password: 'secret' };
const USER = { email: 'smith@example.com', password: 'secret' };

beforeAll(async () => {
    await makeConnection();
});

describe(`GET ${USERS_URL}`, () => {
    test('admin user can get all users', async done => {
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const users = await User.find({}, {}, { limit: 50 })
            .lean()
            .select('name email role discount');
        const res = await server.get(`${USERS_URL}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('users');
        expect(res.body.data.users).toEqual(JSON.parse(JSON.stringify(users)));

        done();
    });

    test('admin user can get all users shifted by offset', async done => {
        const offset = 10;
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const users = await User.find({}, {}, { limit: 50, skip: offset })
            .lean()
            .select('name email role discount');
        const res = await server.get(`${USERS_URL}?offset=${offset}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('users');
        expect(res.body.data.users).toEqual(JSON.parse(JSON.stringify(users)));

        done();
    });

    test('admin user can get all users filtered by name substring', async done => {
        const user = (await User.find({}, {}, { limit: 1, skip: faker.random.number({ min: 1, max: 10 }) }))[0];
        const searchName = user.name.substring(1, 5);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const users = await User.find({ name: new RegExp(searchName, 'i') }, {}, { limit: 50 })
            .lean()
            .select('name email role discount');
        const res = await server
            .get(`${USERS_URL}?name=${encodeURIComponent(searchName)}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('users');
        expect(res.body.data.users).toEqual(JSON.parse(JSON.stringify(users)));

        done();
    });

    test('admin user can get all users filtered by email substring', async done => {
        const user = (await User.find({}, {}, { limit: 1, skip: faker.random.number({ min: 1, max: 10 }) }))[0];
        const searchEmail = user.email.substring(1, 5);
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const users = await User.find({ email: new RegExp(searchEmail, 'i') }, {}, { limit: 50 })
            .lean()
            .select('name email role discount');
        const res = await server
            .get(`${USERS_URL}?email=${encodeURIComponent(searchEmail)}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('users');
        expect(res.body.data.users).toEqual(JSON.parse(JSON.stringify(users)));

        done();
    });

    test('unauthorized can not get all users', async done => {
        const res = await server.get(`${USERS_URL}`);

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('not admin user can not get all users', async done => {
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server.get(`${USERS_URL}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(403);
        expect(res.body.status).toBe('failed');

        done();
    });
});

describe(`GET ${USERS_URL}/:id`, () => {
    test('admin user can get user by valid mongodb id', async done => {
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const user = (await User.find({}, {}, { limit: 1 })
            .lean()
            .select('name email role discount'))[0];
        const res = await server.get(`${USERS_URL}/${user._id}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data.user).toEqual(JSON.parse(JSON.stringify(user)));

        done();
    });

    test('admin user can not get user by non-existent mongodb id', async done => {
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .get(`${USERS_URL}/${mongoose.Types.ObjectId()}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('admin user can not get user by invalid mongodb id', async done => {
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .get(`${USERS_URL}/${faker.random.alphaNumeric(10)}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('unauthorized can not get user', async done => {
        const user = (await User.find({}, {}, { limit: 1 })
            .lean()
            .select('name email role discount'))[0];
        const res = await server.get(`${USERS_URL}/${user._id}`);

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('not admin user can not get user', async done => {
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const user = (await User.find({}, {}, { limit: 1 })
            .lean()
            .select('name email role discount'))[0];
        const res = await server.get(`${USERS_URL}/${user._id}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(403);
        expect(res.body.status).toBe('failed');

        done();
    });
});
