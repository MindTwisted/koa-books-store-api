const faker = require('faker');
const supertest = require('supertest');
const mongoose = require('mongoose');
const makeConnection = require('@database/connection');
const Cart = require('@models/cart');
const Book = require('@models/book');
const User = require('@models/user');
const app = require('@root/app/app');
const server = supertest.agent(app.callback());
const AUTH_URL = '/api/auth';
const CART_URL = '/api/cart';
const ADMIN_USER = { email: 'john@example.com', password: 'secret' };
const USER = { email: 'smith@example.com', password: 'secret' };

beforeAll(async () => {
    await makeConnection();
});

describe(`GET ${CART_URL}`, () => {
    test('admin user can get own cart info', async done => {
        const user = await User.findOne({ email: ADMIN_USER.email });
        const cart = await Cart.find({ user: user._id })
            .populate({
                path: 'book',
                select: 'title description price discount image',
                populate: [{ path: 'authors', select: 'name' }, { path: 'genres', select: 'name' }],
            })
            .select('count book')
            .lean({ virtuals: true });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server.get(`${CART_URL}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data).toHaveProperty('cart');
        expect(res.body.data.user).toEqual(JSON.parse(JSON.stringify(user)));
        expect(res.body.data.cart).toEqual(JSON.parse(JSON.stringify(cart)));

        done();
    });

    test('user can get own cart info', async done => {
        const user = await User.findOne({ email: USER.email });
        const cart = await Cart.find({ user: user._id })
            .populate({
                path: 'book',
                select: 'title description price discount image',
                populate: [{ path: 'authors', select: 'name' }, { path: 'genres', select: 'name' }],
            })
            .select('count book')
            .lean({ virtuals: true });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server.get(`${CART_URL}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data).toHaveProperty('cart');
        expect(res.body.data.user).toEqual(JSON.parse(JSON.stringify(user)));
        expect(res.body.data.cart).toEqual(JSON.parse(JSON.stringify(cart)));

        done();
    });

    test('unauthorized can not get own cart info', async done => {
        const res = await server.get(`${CART_URL}`);

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });
});

describe(`POST ${CART_URL}`, () => {
    test('admin user can add book to cart with valid data provided', async done => {
        const user = await User.findOne({ email: ADMIN_USER.email });
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
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data.cart.count).toEqual(count);
        expect(res.body.data.cart.book._id).toEqual(book._id.toString());
        expect(res.body.data.user).toEqual(JSON.parse(JSON.stringify(user)));

        done();
    });

    test('user can add book to cart with valid data provided', async done => {
        const user = await User.findOne({ email: USER.email });
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
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data.cart.count).toEqual(count);
        expect(res.body.data.cart.book._id).toEqual(book._id.toString());
        expect(res.body.data.user).toEqual(JSON.parse(JSON.stringify(user)));

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
        const user = await User.findOne({ email: USER.email });
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
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data.cart.count).toEqual(count);
        expect(res.body.data.cart.book._id).toEqual(book._id.toString());
        expect(res.body.data.user).toEqual(JSON.parse(JSON.stringify(user)));

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

    test('unauthorized can not add book to cart with valid data provided', async done => {
        const count = faker.random.number({ min: 1, max: 100 });
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });
        const res = await server.post(`${CART_URL}`).send({
            count,
            book: book._id,
        });

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });
});

describe(`PUT ${CART_URL}/:id`, () => {
    test('admin user can update own cart with valid data provided and with valid id', async done => {
        const user = await User.findOne({ email: ADMIN_USER.email });
        const count = faker.random.number({ min: 1, max: 100 });
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });
        const cart = await Cart.create({
            count: faker.random.number({ min: 200, max: 300 }),
            book: book._id,
            user: user._id,
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${CART_URL}/${cart._id}`)
            .send({
                count,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('cart');
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data.cart.count).toEqual(count);
        expect(res.body.data.cart.book._id).toEqual(book._id.toString());
        expect(res.body.data.user).toEqual(JSON.parse(JSON.stringify(user)));

        done();
    });

    test('user can update own cart with valid data provided and with valid id', async done => {
        const user = await User.findOne({ email: USER.email });
        const count = faker.random.number({ min: 1, max: 100 });
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });
        const cart = await Cart.create({
            count: faker.random.number({ min: 200, max: 300 }),
            book: book._id,
            user: user._id,
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .put(`${CART_URL}/${cart._id}`)
            .send({
                count,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('cart');
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data.cart.count).toEqual(count);
        expect(res.body.data.cart.book._id).toEqual(book._id.toString());
        expect(res.body.data.user).toEqual(JSON.parse(JSON.stringify(user)));

        done();
    });

    test('user can not update own cart with empty count', async done => {
        const user = await User.findOne({ email: USER.email });
        const count = '';
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });
        const cart = await Cart.create({
            count: faker.random.number({ min: 200, max: 300 }),
            book: book._id,
            user: user._id,
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .put(`${CART_URL}/${cart._id}`)
            .send({
                count,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).toHaveProperty('count');
        expect(res.body.data.errors).not.toHaveProperty('user');
        expect(res.body.data.errors).not.toHaveProperty('book');

        done();
    });

    test('user can not update own cart with count less than 1', async done => {
        const user = await User.findOne({ email: USER.email });
        const count = faker.random.number({ min: -100, max: 0 });
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });
        const cart = await Cart.create({
            count: faker.random.number({ min: 200, max: 300 }),
            book: book._id,
            user: user._id,
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .put(`${CART_URL}/${cart._id}`)
            .send({
                count,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).toHaveProperty('count');
        expect(res.body.data.errors).not.toHaveProperty('user');
        expect(res.body.data.errors).not.toHaveProperty('book');

        done();
    });

    test('user can not update cart of other user', async done => {
        const user = await User.findOne({ email: ADMIN_USER.email });
        const count = faker.random.number({ min: 10, max: 100 });
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });
        const cart = await Cart.create({
            count: faker.random.number({ min: 200, max: 300 }),
            book: book._id,
            user: user._id,
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .put(`${CART_URL}/${cart._id}`)
            .send({
                count,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('user can not update cart by non-existent mongodb id', async done => {
        const count = faker.random.number({ min: 10, max: 100 });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .put(`${CART_URL}/${mongoose.Types.ObjectId()}`)
            .send({
                count,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('user can not update cart by invalid mongodb id', async done => {
        const count = faker.random.number({ min: 10, max: 100 });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .put(`${CART_URL}/${faker.random.alphaNumeric(10)}`)
            .send({
                count,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('unauthorized can not update cart', async done => {
        const count = faker.random.number({ min: 10, max: 100 });
        const res = await server.put(`${CART_URL}/${mongoose.Types.ObjectId()}`).send({
            count,
        });

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });
});

describe(`DELETE ${CART_URL}/:id`, () => {
    test('admin user can delete from own cart with valid id', async done => {
        const user = await User.findOne({ email: ADMIN_USER.email });
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });
        const cart = await Cart.create({
            count: faker.random.number({ min: 200, max: 300 }),
            book: book._id,
            user: user._id,
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server.delete(`${CART_URL}/${cart._id}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');

        const updatedCart = await Cart.find({ user: user._id.toString() });
        const updatedCartIds = updatedCart.map(cart => cart._id.toString());

        expect(updatedCartIds.includes(cart._id.toString())).toEqual(false);

        done();
    });

    test('user can delete from own cart with valid id', async done => {
        const user = await User.findOne({ email: USER.email });
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });
        const cart = await Cart.create({
            count: faker.random.number({ min: 200, max: 300 }),
            book: book._id,
            user: user._id,
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server.delete(`${CART_URL}/${cart._id}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');

        const updatedCart = await Cart.find({ user: user._id.toString() });
        const updatedCartIds = updatedCart.map(cart => cart._id.toString());

        expect(updatedCartIds.includes(cart._id.toString())).toEqual(false);

        done();
    });

    test('user can not delete from cart of other user', async done => {
        const user = await User.findOne({ email: ADMIN_USER.email });
        const book = await Book.create({
            title: faker.lorem.words(6),
            description: faker.lorem.words(20),
            price: faker.random.number({ min: 30, max: 100 }),
            discount: faker.random.number({ min: 0, max: 50 }),
        });
        const cart = await Cart.create({
            count: faker.random.number({ min: 200, max: 300 }),
            book: book._id,
            user: user._id,
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server.delete(`${CART_URL}/${cart._id}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('user can not delete from cart with non-existent mongodb id', async done => {
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .delete(`${CART_URL}/${mongoose.Types.ObjectId()}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('user can not delete from cart with invalid mongodb id', async done => {
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .delete(`${CART_URL}/${faker.random.alphaNumeric(10)}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('unauthorized can not delete from cart', async done => {
        const res = await server.delete(`${CART_URL}/${mongoose.Types.ObjectId()}`);

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });
});
