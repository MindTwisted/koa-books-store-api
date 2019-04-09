process.env.NODE_ENV = 'testing';

const faker = require('faker');
const supertest = require('supertest');
const app = require('@root/app/app');
const connection = require('@database/connection');
const server = supertest.agent(app.callback());
const AUTH_URL = '/api/auth';

afterAll(async () => {
    (await connection).connections[0].db.dropDatabase();
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
