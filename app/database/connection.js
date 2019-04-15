const mongoose = require('mongoose');
const config = require('@config/config');
const User = require('@models/user');
const Author = require('@models/author');
const Genre = require('@models/genre');

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

    await Promise.all([User.init(), Author.init(), Genre.init()]);

    return connection;
};

module.exports = makeConnection;
