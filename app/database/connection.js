const mongoose = require('mongoose');
const User = require('@models/user');

const connect = () => {
    return mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}`, {
        useNewUrlParser: true,
        user: process.env.DB_USER,
        pass: process.env.DB_PASSWORD,
        dbName: process.env.DB_DATABASE,
    });
};

const connection = async () => {
    await connect();
    await Promise.all([User.init()]);
};

module.exports = connection;
