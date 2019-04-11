require('module-alias/register');

process.env.NODE_ENV = 'testing';

global.connection = require('@database/connection');

const seeder = require('@database/seeders');

module.exports = async () => {
    await seeder.authorSeeder();
};
