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

describe(`PUT ${USERS_URL}/:id`, () => {
    test('admin user can update user by valid mongodb id and with valid data', async done => {
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = faker.internet.exampleEmail();
        const updateDiscount = faker.random.number({ min: 0, max: 50 });
        const user = await User.create({
            name: faker.random.alphaNumeric(6),
            email: faker.internet.exampleEmail(),
            password: faker.random.alphaNumeric(6),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}/${user._id}`)
            .send({
                name: updateName,
                email: updateEmail,
                discount: updateDiscount,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data.user.name).toEqual(updateName);
        expect(res.body.data.user.email).toEqual(updateEmail);
        expect(res.body.data.user.discount).toEqual(updateDiscount);

        done();
    });

    test('admin user can not update user by valid mongodb id and with empty name', async done => {
        const updateName = '';
        const updateEmail = faker.internet.exampleEmail();
        const updateDiscount = faker.random.number({ min: 0, max: 50 });
        const user = await User.create({
            name: faker.random.alphaNumeric(6),
            email: faker.internet.exampleEmail(),
            password: faker.random.alphaNumeric(6),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}/${user._id}`)
            .send({
                name: updateName,
                email: updateEmail,
                discount: updateDiscount,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).toHaveProperty('name');
        expect(res.body.data.errors).not.toHaveProperty('email');
        expect(res.body.data.errors).not.toHaveProperty('discount');

        done();
    });

    test('admin user can not update user by valid mongodb id and with name shorter than 6 chars', async done => {
        const updateName = faker.random.alphaNumeric(5);
        const updateEmail = faker.internet.exampleEmail();
        const updateDiscount = faker.random.number({ min: 0, max: 50 });
        const user = await User.create({
            name: faker.random.alphaNumeric(6),
            email: faker.internet.exampleEmail(),
            password: faker.random.alphaNumeric(6),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}/${user._id}`)
            .send({
                name: updateName,
                email: updateEmail,
                discount: updateDiscount,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).toHaveProperty('name');
        expect(res.body.data.errors).not.toHaveProperty('email');
        expect(res.body.data.errors).not.toHaveProperty('discount');

        done();
    });

    test('admin user can not update user by valid mongodb id and with empty email', async done => {
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = '';
        const updateDiscount = faker.random.number({ min: 0, max: 50 });
        const user = await User.create({
            name: faker.random.alphaNumeric(6),
            email: faker.internet.exampleEmail(),
            password: faker.random.alphaNumeric(6),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}/${user._id}`)
            .send({
                name: updateName,
                email: updateEmail,
                discount: updateDiscount,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).not.toHaveProperty('name');
        expect(res.body.data.errors).toHaveProperty('email');
        expect(res.body.data.errors).not.toHaveProperty('discount');

        done();
    });

    test('admin user can not update user by valid mongodb id and with invalid email', async done => {
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = faker.random.alphaNumeric(10);
        const updateDiscount = faker.random.number({ min: 0, max: 50 });
        const user = await User.create({
            name: faker.random.alphaNumeric(6),
            email: faker.internet.exampleEmail(),
            password: faker.random.alphaNumeric(6),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}/${user._id}`)
            .send({
                name: updateName,
                email: updateEmail,
                discount: updateDiscount,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).not.toHaveProperty('name');
        expect(res.body.data.errors).toHaveProperty('email');
        expect(res.body.data.errors).not.toHaveProperty('discount');

        done();
    });

    test('admin user can not update user by valid mongodb id and with duplicate email', async done => {
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = (await User.find({}, {}, { limit: 1 }))[0].email;
        const updateDiscount = faker.random.number({ min: 0, max: 50 });
        const user = await User.create({
            name: faker.random.alphaNumeric(6),
            email: faker.internet.exampleEmail(),
            password: faker.random.alphaNumeric(6),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}/${user._id}`)
            .send({
                name: updateName,
                email: updateEmail,
                discount: updateDiscount,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).not.toHaveProperty('name');
        expect(res.body.data.errors).toHaveProperty('email');
        expect(res.body.data.errors).not.toHaveProperty('discount');

        done();
    });

    test('admin user can not update user by valid mongodb id and with empty discount', async done => {
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = faker.internet.exampleEmail();
        const updateDiscount = '';
        const user = await User.create({
            name: faker.random.alphaNumeric(6),
            email: faker.internet.exampleEmail(),
            password: faker.random.alphaNumeric(6),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}/${user._id}`)
            .send({
                name: updateName,
                email: updateEmail,
                discount: updateDiscount,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).not.toHaveProperty('name');
        expect(res.body.data.errors).not.toHaveProperty('email');
        expect(res.body.data.errors).toHaveProperty('discount');

        done();
    });

    test('admin user can not update user by valid mongodb id and with discount less than 0', async done => {
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = faker.internet.exampleEmail();
        const updateDiscount = -1;
        const user = await User.create({
            name: faker.random.alphaNumeric(6),
            email: faker.internet.exampleEmail(),
            password: faker.random.alphaNumeric(6),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}/${user._id}`)
            .send({
                name: updateName,
                email: updateEmail,
                discount: updateDiscount,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).not.toHaveProperty('name');
        expect(res.body.data.errors).not.toHaveProperty('email');
        expect(res.body.data.errors).toHaveProperty('discount');

        done();
    });

    test('admin user can not update user by valid mongodb id and with discount greater than 50', async done => {
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = faker.internet.exampleEmail();
        const updateDiscount = 51;
        const user = await User.create({
            name: faker.random.alphaNumeric(6),
            email: faker.internet.exampleEmail(),
            password: faker.random.alphaNumeric(6),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}/${user._id}`)
            .send({
                name: updateName,
                email: updateEmail,
                discount: updateDiscount,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).not.toHaveProperty('name');
        expect(res.body.data.errors).not.toHaveProperty('email');
        expect(res.body.data.errors).toHaveProperty('discount');

        done();
    });

    test('admin user can not update user by valid mongodb id and with discount not numeric', async done => {
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = faker.internet.exampleEmail();
        const updateDiscount = faker.random.alphaNumeric(10);
        const user = await User.create({
            name: faker.random.alphaNumeric(6),
            email: faker.internet.exampleEmail(),
            password: faker.random.alphaNumeric(6),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}/${user._id}`)
            .send({
                name: updateName,
                email: updateEmail,
                discount: updateDiscount,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).not.toHaveProperty('name');
        expect(res.body.data.errors).not.toHaveProperty('email');
        expect(res.body.data.errors).toHaveProperty('discount');

        done();
    });

    test('admin user can not update user by valid mongodb id and with discount not integer', async done => {
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = faker.internet.exampleEmail();
        const updateDiscount = faker.random.number({ min: 1, max: 50 }) / 100;
        const user = await User.create({
            name: faker.random.alphaNumeric(6),
            email: faker.internet.exampleEmail(),
            password: faker.random.alphaNumeric(6),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}/${user._id}`)
            .send({
                name: updateName,
                email: updateEmail,
                discount: updateDiscount,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).not.toHaveProperty('name');
        expect(res.body.data.errors).not.toHaveProperty('email');
        expect(res.body.data.errors).toHaveProperty('discount');

        done();
    });

    test('admin user can not update user by non-existent mongodb id and with valid data', async done => {
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = faker.internet.exampleEmail();
        const updateDiscount = faker.random.number({ min: 0, max: 50 });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}/${mongoose.Types.ObjectId()}`)
            .send({
                name: updateName,
                email: updateEmail,
                discount: updateDiscount,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('admin user can not update user by invalid mongodb id and with valid data', async done => {
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = faker.internet.exampleEmail();
        const updateDiscount = faker.random.number({ min: 0, max: 50 });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: ADMIN_USER.email,
            password: ADMIN_USER.password,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}/${faker.random.alphaNumeric(10)}`)
            .send({
                name: updateName,
                email: updateEmail,
                discount: updateDiscount,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('unauthorized can not update user by valid mongodb id and with valid data', async done => {
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = faker.internet.exampleEmail();
        const updateDiscount = faker.random.number({ min: 0, max: 50 });
        const user = await User.create({
            name: faker.random.alphaNumeric(6),
            email: faker.internet.exampleEmail(),
            password: faker.random.alphaNumeric(6),
        });
        const res = await server.put(`${USERS_URL}/${user._id}`).send({
            name: updateName,
            email: updateEmail,
            discount: updateDiscount,
        });

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });

    test('not admin user can not update user by valid mongodb id and with valid data', async done => {
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = faker.internet.exampleEmail();
        const updateDiscount = faker.random.number({ min: 0, max: 50 });
        const user = await User.create({
            name: faker.random.alphaNumeric(6),
            email: faker.internet.exampleEmail(),
            password: faker.random.alphaNumeric(6),
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: USER.email,
            password: USER.password,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}/${user._id}`)
            .send({
                name: updateName,
                email: updateEmail,
                discount: updateDiscount,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(403);
        expect(res.body.status).toBe('failed');

        done();
    });
});

describe(`PUT ${USERS_URL}`, () => {
    test('admin user can update himself with valid data', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const initialEmail = faker.internet.exampleEmail();
        const initialPassword = faker.random.alphaNumeric(6);
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = faker.internet.exampleEmail();
        const updatePassword = faker.random.alphaNumeric(6);
        const initialUser = await User.create({
            name: initialName,
            email: initialEmail,
            password: initialPassword,
            role: 'admin',
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: initialEmail,
            password: initialPassword,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}`)
            .send({
                name: updateName,
                email: updateEmail,
                password: updatePassword,
            })
            .set('Authorization', `Bearer ${token}`);
        const updatedUser = await User.findById(initialUser._id);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data.user.name).toEqual(updateName);
        expect(res.body.data.user.email).toEqual(updateEmail);
        expect(res.body.data.user.role).toEqual('admin');
        expect(await updatedUser.isValidPassword(initialPassword)).toEqual(false);
        expect(await updatedUser.isValidPassword(updatePassword)).toEqual(true);

        done();
    });

    test('not admin user can update himself with valid data', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const initialEmail = faker.internet.exampleEmail();
        const initialPassword = faker.random.alphaNumeric(6);
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = faker.internet.exampleEmail();
        const updatePassword = faker.random.alphaNumeric(6);
        const initialUser = await User.create({
            name: initialName,
            email: initialEmail,
            password: initialPassword,
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: initialEmail,
            password: initialPassword,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}`)
            .send({
                name: updateName,
                email: updateEmail,
                password: updatePassword,
            })
            .set('Authorization', `Bearer ${token}`);
        const updatedUser = await User.findById(initialUser._id);

        expect(res.status).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data.user.name).toEqual(updateName);
        expect(res.body.data.user.email).toEqual(updateEmail);
        expect(res.body.data.user.role).toEqual('user');
        expect(await updatedUser.isValidPassword(initialPassword)).toEqual(false);
        expect(await updatedUser.isValidPassword(updatePassword)).toEqual(true);

        done();
    });

    test('user can not update himself with empty name', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const initialEmail = faker.internet.exampleEmail();
        const initialPassword = faker.random.alphaNumeric(6);
        const updateName = '';
        const updateEmail = faker.internet.exampleEmail();
        const updatePassword = faker.random.alphaNumeric(6);
        await User.create({
            name: initialName,
            email: initialEmail,
            password: initialPassword,
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: initialEmail,
            password: initialPassword,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}`)
            .send({
                name: updateName,
                email: updateEmail,
                password: updatePassword,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).toHaveProperty('name');
        expect(res.body.data.errors).not.toHaveProperty('email');
        expect(res.body.data.errors).not.toHaveProperty('password');

        done();
    });

    test('user can not update himself with name shorter than 6 chars', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const initialEmail = faker.internet.exampleEmail();
        const initialPassword = faker.random.alphaNumeric(6);
        const updateName = faker.random.alphaNumeric(5);
        const updateEmail = faker.internet.exampleEmail();
        const updatePassword = faker.random.alphaNumeric(6);
        await User.create({
            name: initialName,
            email: initialEmail,
            password: initialPassword,
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: initialEmail,
            password: initialPassword,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}`)
            .send({
                name: updateName,
                email: updateEmail,
                password: updatePassword,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).toHaveProperty('name');
        expect(res.body.data.errors).not.toHaveProperty('email');
        expect(res.body.data.errors).not.toHaveProperty('password');

        done();
    });

    test('user can not update himself with empty email', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const initialEmail = faker.internet.exampleEmail();
        const initialPassword = faker.random.alphaNumeric(6);
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = '';
        const updatePassword = faker.random.alphaNumeric(6);
        await User.create({
            name: initialName,
            email: initialEmail,
            password: initialPassword,
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: initialEmail,
            password: initialPassword,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}`)
            .send({
                name: updateName,
                email: updateEmail,
                password: updatePassword,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).not.toHaveProperty('name');
        expect(res.body.data.errors).toHaveProperty('email');
        expect(res.body.data.errors).not.toHaveProperty('password');

        done();
    });

    test('user can not update himself with not valid email', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const initialEmail = faker.internet.exampleEmail();
        const initialPassword = faker.random.alphaNumeric(6);
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = faker.random.alphaNumeric(10);
        const updatePassword = faker.random.alphaNumeric(6);
        await User.create({
            name: initialName,
            email: initialEmail,
            password: initialPassword,
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: initialEmail,
            password: initialPassword,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}`)
            .send({
                name: updateName,
                email: updateEmail,
                password: updatePassword,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).not.toHaveProperty('name');
        expect(res.body.data.errors).toHaveProperty('email');
        expect(res.body.data.errors).not.toHaveProperty('password');

        done();
    });

    test('user can not update himself with duplicate email', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const initialEmail = faker.internet.exampleEmail();
        const initialPassword = faker.random.alphaNumeric(6);
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = (await User.find({}, {}, { limit: 1 }))[0].email;
        const updatePassword = faker.random.alphaNumeric(6);
        await User.create({
            name: initialName,
            email: initialEmail,
            password: initialPassword,
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: initialEmail,
            password: initialPassword,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}`)
            .send({
                name: updateName,
                email: updateEmail,
                password: updatePassword,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).not.toHaveProperty('name');
        expect(res.body.data.errors).toHaveProperty('email');
        expect(res.body.data.errors).not.toHaveProperty('password');

        done();
    });

    test('user can not update himself with empty password', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const initialEmail = faker.internet.exampleEmail();
        const initialPassword = faker.random.alphaNumeric(6);
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = faker.internet.exampleEmail();
        const updatePassword = '';
        await User.create({
            name: initialName,
            email: initialEmail,
            password: initialPassword,
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: initialEmail,
            password: initialPassword,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}`)
            .send({
                name: updateName,
                email: updateEmail,
                password: updatePassword,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).not.toHaveProperty('name');
        expect(res.body.data.errors).not.toHaveProperty('email');
        expect(res.body.data.errors).toHaveProperty('password');

        done();
    });

    test('user can not update himself with password shorter than 6 chars', async done => {
        const initialName = faker.random.alphaNumeric(6);
        const initialEmail = faker.internet.exampleEmail();
        const initialPassword = faker.random.alphaNumeric(6);
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = faker.internet.exampleEmail();
        const updatePassword = faker.random.alphaNumeric(5);
        await User.create({
            name: initialName,
            email: initialEmail,
            password: initialPassword,
        });
        const token = (await server.put(`${AUTH_URL}`).send({
            email: initialEmail,
            password: initialPassword,
        })).body.data.token;
        const res = await server
            .put(`${USERS_URL}`)
            .send({
                name: updateName,
                email: updateEmail,
                password: updatePassword,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(422);
        expect(res.body.status).toBe('failed');
        expect(res.body.data).toHaveProperty('errors');
        expect(res.body.data.errors).not.toHaveProperty('name');
        expect(res.body.data.errors).not.toHaveProperty('email');
        expect(res.body.data.errors).toHaveProperty('password');

        done();
    });

    test('unauthorized can not update himself', async done => {
        const updateName = faker.random.alphaNumeric(6);
        const updateEmail = faker.internet.exampleEmail();
        const updatePassword = faker.random.alphaNumeric(6);
        const res = await server.put(`${USERS_URL}`).send({
            name: updateName,
            email: updateEmail,
            password: updatePassword,
        });

        expect(res.status).toEqual(401);
        expect(res.body.status).toBe('failed');

        done();
    });
});
