const mongoose = require('mongoose');
const User = require('@models/user');
const Author = require('@models/author');
const config = require('@config/config');

const connect = () => {
    return mongoose.connect(`mongodb://${config.DB_HOST}:${config.DB_PORT}`, {
        useNewUrlParser: true,
        user: config.DB_USER,
        pass: config.DB_PASSWORD,
        dbName: config.DB_DATABASE,
    });
};

const makeConnection = async () => {
    const connection = await connect();

    await Promise.all([User.init(), Author.init()]);

    return connection;
};

const connection = makeConnection();

module.exports = connection;
