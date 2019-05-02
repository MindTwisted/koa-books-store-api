const supertest = require('supertest');
const makeConnection = require('@database/connection');
const PaymentType = require('@models/paymentType');
const app = require('@root/app/app');
const server = supertest.agent(app.callback());
const AUTH_URL = '/api/auth';
const PAYMENT_TYPES_URL = '/api/payment-types';
const ADMIN_USER = { email: 'john@example.com', password: 'secret' };
const USER = { email: 'smith@example.com', password: 'secret' };

beforeAll(async () => {
    await makeConnection();
});

describe(`GET ${PAYMENT_TYPES_URL}`, () => {
    test('admin user can get all paymentTypes', async done => {
        const paymentTypes = await PaymentType.find({})
            .lean()
            .select('name');
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server.get(`${PAYMENT_TYPES_URL}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('paymentTypes');
        expect(res.body.data.paymentTypes).toEqual(JSON.parse(JSON.stringify(paymentTypes)));

        done();
    });

    test('user can get all paymentTypes', async done => {
        const paymentTypes = await PaymentType.find({})
            .lean()
            .select('name');
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server.get(`${PAYMENT_TYPES_URL}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('paymentTypes');
        expect(res.body.data.paymentTypes).toEqual(JSON.parse(JSON.stringify(paymentTypes)));

        done();
    });

    test('unauthorized can not get all paymentTypes', async done => {
        const res = await server.get(`${PAYMENT_TYPES_URL}`);

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });
});
