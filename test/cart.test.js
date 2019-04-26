const faker = require('faker');
const supertest = require('supertest');
const mongoose = require('mongoose');
const makeConnection = require('@database/connection');
const Cart = require('@models/cart');
const Book = require('@models/book');
const app = require('@root/app/app');
const server = supertest.agent(app.callback());
const AUTH_URL = '/api/auth';
const CART_URL = '/api/cart';
const ADMIN_USER = { email: 'john@example.com', password: 'secret' };
const USER = { email: 'smith@example.com', password: 'secret' };

beforeAll(async () => {
    await makeConnection();
});

describe(`POST ${CART_URL}`, () => {
    test('admin user can add book to cart with valid data provided', async done => {
        const count = faker.random.number({ min: 1, max: 100 });
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .post(`${CART_URL}`)
            .send({
                count,
                book: book._id,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('cart');
        expect(res.body.data.cart.count).toEqual(count);
        expect(res.body.data.cart.book._id).toEqual(book._id.toString());
        expect(res.body.data.cart.user.email).toEqual(ADMIN_USER.email);

        done();
    });

    test('user can add book to cart with valid data provided', async done => {
        const count = faker.random.number({ min: 1, max: 100 });
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .post(`${CART_URL}`)
            .send({
                count,
                book: book._id,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('cart');
        expect(res.body.data.cart.count).toEqual(count);
        expect(res.body.data.cart.book._id).toEqual(book._id.toString());
        expect(res.body.data.cart.user.email).toEqual(USER.email);

        done();
    });

    test('user can not add book to cart with empty count', async done => {
        const count = '';
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .post(`${CART_URL}`)
            .send({
                count,
                book: book._id,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).toHaveProperty('count');
        expect(res.body.data.errors).not.toHaveProperty('book');

        done();
    });

    test('user can not add book to cart with count less than 1', async done => {
        const count = faker.random.number({ min: -100, max: 0 });
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .post(`${CART_URL}`)
            .send({
                count,
                book: book._id,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).toHaveProperty('count');
        expect(res.body.data.errors).not.toHaveProperty('book');

        done();
    });

    test('user can not add book to cart with count not numeric', async done => {
        const count = faker.random.alphaNumeric(10);
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .post(`${CART_URL}`)
            .send({
                count,
                book: book._id,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).toHaveProperty('count');
        expect(res.body.data.errors).not.toHaveProperty('book');

        done();
    });

    test('user can not add book to cart with count not integer', async done => {
        const count = faker.random.number({ min: 1, max: 99 }) / 100;
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .post(`${CART_URL}`)
            .send({
                count,
                book: book._id,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).toHaveProperty('count');
        expect(res.body.data.errors).not.toHaveProperty('book');

        done();
    });

    test('user can not add book to cart with empty book id', async done => {
        const count = faker.random.number({ min: 1, max: 99 });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .post(`${CART_URL}`)
            .send({
                count,
                book: '',
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).not.toHaveProperty('count');
        expect(res.body.data.errors).toHaveProperty('book');

        done();
    });

    test('user can not add book to cart with non-existent book id', async done => {
        const count = faker.random.number({ min: 1, max: 99 });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .post(`${CART_URL}`)
            .send({
                count,
                book: mongoose.Types.ObjectId(),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).not.toHaveProperty('count');
        expect(res.body.data.errors).toHaveProperty('book');

        done();
    });

    test('user can not add book to cart with invalid book id', async done => {
        const count = faker.random.number({ min: 1, max: 99 });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .post(`${CART_URL}`)
            .send({
                count,
                book: faker.random.alphaNumeric(10),
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).not.toHaveProperty('count');
        expect(res.body.data.errors).toHaveProperty('book');

        done();
    });

    test('user can not add book to cart with duplicate book id', async done => {
        const count = faker.random.number({ min: 1, max: 99 });
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .post(`${CART_URL}`)
            .send({
                count,
                book: book._id,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('cart');
        expect(res.body.data.cart.count).toEqual(count);
        expect(res.body.data.cart.book._id).toEqual(book._id.toString());
        expect(res.body.data.cart.user.email).toEqual(USER.email);

        const resDuplicate = await server
            .post(`${CART_URL}`)
            .send({
                count,
                book: book._id,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(resDuplicate.status).toEqual(422);
        expect(resDuplicate.body.status).toBe('failed');
        expect(resDuplicate.body.data).toHaveProperty('errors');
        expect(resDuplicate.body.data.errors).not.toHaveProperty('count');
        expect(resDuplicate.body.data.errors).toHaveProperty('book');
        expect(resDuplicate.body.data.errors).toHaveProperty('user');

        done();
    });
});
