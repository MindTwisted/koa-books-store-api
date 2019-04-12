const faker = require('faker');
const supertest = require('supertest');
const makeConnection = require('@database/connection');
const app = require('@root/app/app');
const server = supertest.agent(app.callback());
const AUTH_URL = '/api/auth';

beforeAll(async () => {
    await makeConnection();
});

describe(`POST ${AUTH_URL}`, () => {
    test('user can register with valid data', async done => {
        const name = faker.random.alphaNumeric(6);
        const email = faker.internet.email();
        const password = faker.random.alphaNumeric(6);

        const res = await server.post(`${AUTH_URL}`).send({
            name,
            email,
            password,
        });

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.user.name).toBe(name);
        expect(res.body.data.user.email).toBe(email);

        done();
    });

    test('user can not register without name, email and password', async done => {
        const res = await server.post(`${AUTH_URL}`).send({});

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('name', 'email', 'password');

        done();
    });

    test('user can not register with name shorter than 6 letters', async done => {
        const name = faker.random.alphaNumeric(5);
        const email = faker.internet.email();
        const password = faker.random.alphaNumeric(6);

        const res = await server.post(`${AUTH_URL}`).send({
            name,
            email,
            password,
        });

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('name');
        expect(res.body.data.errors).not.toHaveProperty('email', 'password');

        done();
    });

    test('user can not register with password shorter than 6 letters', async done => {
        const name = faker.random.alphaNumeric(6);
        const email = faker.internet.email();
        const password = faker.random.alphaNumeric(5);

        const res = await server.post(`${AUTH_URL}`).send({
            name,
            email,
            password,
        });

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('password');
        expect(res.body.data.errors).not.toHaveProperty('name', 'email');

        done();
    });

    test('user can not register with invalid email', async done => {
        const name = faker.random.alphaNumeric(6);
        const email = faker.random.alphaNumeric(6);
        const password = faker.random.alphaNumeric(6);

        const res = await server.post(`${AUTH_URL}`).send({
            name,
            email,
            password,
        });

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('email');
        expect(res.body.data.errors).not.toHaveProperty('name', 'password');

        done();
    });

    test('user can not register with duplicate email', async done => {
        const name = faker.random.alphaNumeric(6);
        const email = faker.internet.email();
        const password = faker.random.alphaNumeric(6);

        await server.post(`${AUTH_URL}`).send({
            name,
            email,
            password,
        });

        const res = await server.post(`${AUTH_URL}`).send({
            name,
            email,
            password,
        });

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data.errors).toHaveProperty('email');
        expect(res.body.data.errors).not.toHaveProperty('name', 'password');

        done();
    });
});

describe(`PUT ${AUTH_URL}`, () => {
    test('user can login with valid data', async done => {
        const name = faker.random.alphaNumeric(6);
        const email = faker.internet.email();
        const password = faker.random.alphaNumeric(6);

        await server.post(`${AUTH_URL}`).send({
            name,
            email,
            password,
        });

        const res = await server.put(`${AUTH_URL}`).send({
            email,
            password,
        });

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.user.name).toBe(name);
        expect(res.body.data.user.email).toBe(email);
        expect(res.body.data).toHaveProperty('token');

        done();
    });

    test('user can not login without email and password', async done => {
        const res = await server.put(`${AUTH_URL}`).send({});

        expect(res.status).toEqual(403);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('user can not login with invalid email', async done => {
        const name = faker.random.alphaNumeric(6);
        const email = faker.internet.email();
        const password = faker.random.alphaNumeric(6);

        await server.post(`${AUTH_URL}`).send({
            name,
            email,
            password,
        });

        const res = await server.put(`${AUTH_URL}`).send({
            email: faker.internet.email(),
            password,
        });

        expect(res.status).toEqual(403);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('user can not login with invalid password', async done => {
        const name = faker.random.alphaNumeric(6);
        const email = faker.internet.email();
        const password = faker.random.alphaNumeric(6);

        await server.post(`${AUTH_URL}`).send({
            name,
            email,
            password,
        });

        const res = await server.put(`${AUTH_URL}`).send({
            email,
            password: faker.random.alphaNumeric(6),
        });

        expect(res.status).toEqual(403);
        expect(res.body.status).toBe('failed');

        done();
    });
});

describe(`GET ${AUTH_URL}`, () => {
    test('user can get current auth info if provide valid token', async done => {
        const name = faker.random.alphaNumeric(6);
        const email = faker.internet.email();
        const password = faker.random.alphaNumeric(6);

        await server.post(`${AUTH_URL}`).send({
            name,
            email,
            password,
        });

        const loginRes = await server.put(`${AUTH_URL}`).send({
            email,
            password,
        });
        const token = loginRes.body.data.token;
        const res = await server.get(`${AUTH_URL}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.user.name).toBe(name);
        expect(res.body.data.user.email).toBe(email);

        done();
    });

    test('user can not get current auth info without token', async done => {
        const res = await server.get(`${AUTH_URL}`);

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('user can not get current auth info if provide invalid token', async done => {
        const token = faker.random.alphaNumeric(20);
        const res = await server.get(`${AUTH_URL}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });
});
