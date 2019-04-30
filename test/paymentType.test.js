const supertest = require('supertest');
const makeConnection = require('@database/connection');
const PaymentType = require('@models/paymentType');
const app = require('@root/app/app');
const server = supertest.agent(app.callback());
const PAYMENT_TYPES_URL = '/api/payment-types';

beforeAll(async () => {
    await makeConnection();
});

describe(`GET ${PAYMENT_TYPES_URL}`, () => {
    test('user can get all paymentTypes', async done => {
        const paymentTypes = await PaymentType.find({})
            .lean()
            .select('name');
        const res = await server.get(`${PAYMENT_TYPES_URL}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('paymentTypes');
        expect(res.body.data.paymentTypes).toEqual(JSON.parse(JSON.stringify(paymentTypes)));

        done();
    });
});
