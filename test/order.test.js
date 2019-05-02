const faker = require('faker');
const supertest = require('supertest');
const mongoose = require('mongoose');
const makeConnection = require('@database/connection');
const Cart = require('@models/cart');
const Book = require('@models/book');
const User = require('@models/user');
const Order = require('@models/order');
const PaymentType = require('@models/paymentType');
const app = require('@root/app/app');
const server = supertest.agent(app.callback());
const AUTH_URL = '/api/auth';
const ORDERS_URL = '/api/orders';
const ADMIN_USER = { email: 'john@example.com', password: 'secret' };
const USER = { email: 'smith@example.com', password: 'secret' };

beforeAll(async () => {
    await makeConnection();
});

describe(`GET ${ORDERS_URL}`, () => {
    test('admin user can get all orders', async done => {
        const limit = 50;
        const orders = await Order.find({}, {}, { limit: 50 })
            .populate('paymentType', 'name')
            .select('status totalDiscount totalPrice details');
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server.get(`${ORDERS_URL}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('orders');
        expect(res.body.data.orders.length).toBeLessThanOrEqual(limit);
        expect(res.body.data.orders).toEqual(JSON.parse(JSON.stringify(orders)));

        done();
    });

    test('admin user can get all orders shifted by offset', async done => {
        const offset = faker.random.number({ min: 1, max: 10 });
        const limit = 50;
        const orders = await Order.find({}, {}, { limit: 50, skip: offset })
            .populate('paymentType', 'name')
            .select('status totalDiscount totalPrice details');
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server.get(`${ORDERS_URL}?offset=${offset}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('orders');
        expect(res.body.data.orders.length).toBeLessThanOrEqual(limit);
        expect(res.body.data.orders).toEqual(JSON.parse(JSON.stringify(orders)));

        done();
    });

    test('admin user can get all orders filtered by user id', async done => {
        const limit = 50;
        const user = await User.findOne();
        const orders = await Order.find({ user: user._id }, {}, { limit: 50 })
            .populate('paymentType', 'name')
            .select('status totalDiscount totalPrice details');
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .get(`${ORDERS_URL}?user=${user._id.toString()}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('orders');
        expect(res.body.data.orders.length).toBeLessThanOrEqual(limit);
        expect(res.body.data.orders).toEqual(JSON.parse(JSON.stringify(orders)));

        done();
    });

    test('admin user can not get all orders filtered by invalid mongodb user id', async done => {
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .get(`${ORDERS_URL}?user=${faker.random.alphaNumeric(10)}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('user can not get all orders', async done => {
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server.get(`${ORDERS_URL}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(403);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('unauthorized can not get all orders', async done => {
        const res = await server.get(`${ORDERS_URL}`);

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });
});

describe(`POST ${ORDERS_URL}`, () => {
    test('admin user can create order with valid payment type and non-empty cart', async done => {
        const count = faker.random.number({ min: 1, max: 100 });
        const user = await User.findOne({ email: ADMIN_USER.email });
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });

        await Cart.create({
            count,
            user: user._id,
            book: book._id,
        });

        const cart = await Cart.find({ user: user._id });
        const paymentType = await PaymentType.findOne();
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${ORDERS_URL}`)
            .send({
                paymentType: paymentType._id,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('order');
        expect(res.body.data.order.details.user.name).toEqual(user.name);
        expect(res.body.data.order.details.user.email).toEqual(user.email);
        expect(res.body.data.order.details.books.length).toEqual(cart.length);

        const updatedCart = await Cart.find({ user: user._id });

        expect(updatedCart.length).toEqual(0);

        done();
    });

    test('user can create order with valid payment type and non-empty cart', async done => {
        const count = faker.random.number({ min: 1, max: 100 });
        const user = await User.findOne({ email: USER.email });
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });

        await Cart.create({
            count,
            user: user._id,
            book: book._id,
        });

        const cart = await Cart.find({ user: user._id });
        const paymentType = await PaymentType.findOne();
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .post(`${ORDERS_URL}`)
            .send({
                paymentType: paymentType._id,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('order');
        expect(res.body.data.order.details.user.name).toEqual(user.name);
        expect(res.body.data.order.details.user.email).toEqual(user.email);
        expect(res.body.data.order.details.books.length).toEqual(cart.length);

        const updatedCart = await Cart.find({ user: user._id });

        expect(updatedCart.length).toEqual(0);

        done();
    });

    test('user can not create order with non-existent payment type mongodb id', async done => {
        const count = faker.random.number({ min: 1, max: 100 });
        const user = await User.findOne({ email: USER.email });
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });

        await Cart.create({
            count,
            user: user._id,
            book: book._id,
        });

        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .post(`${ORDERS_URL}`)
            .send({
                paymentType: mongoose.Types.ObjectId(),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');

        const updatedCart = await Cart.find({ user: user._id });

        expect(updatedCart.length).not.toEqual(0);

        done();
    });

    test('user can not create order with invalid payment type mongodb id', async done => {
        const count = faker.random.number({ min: 1, max: 100 });
        const user = await User.findOne({ email: USER.email });
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });

        await Cart.create({
            count,
            user: user._id,
            book: book._id,
        });

        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .post(`${ORDERS_URL}`)
            .send({
                paymentType: faker.random.alphaNumeric(10),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');

        const updatedCart = await Cart.find({ user: user._id });

        expect(updatedCart.length).not.toEqual(0);

        done();
    });

    test('user can not create order with valid payment type and empty cart', async done => {
        const user = await User.findOne({ email: USER.email });

        await Cart.deleteMany({ user: user._id });

        const paymentType = await PaymentType.findOne();
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .post(`${ORDERS_URL}`)
            .send({
                paymentType: paymentType._id,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });
});
