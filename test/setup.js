require('module-alias/register');

process.env.NODE_ENV = 'testing';

const makeConnection = require('@database/connection');
const seeder = require('@database/seeders');

module.exports = async () => {
    global.connection = await makeConnection();
    await seeder.userSeeder();
    await seeder.authorSeeder();
    await seeder.genreSeeder();
    await seeder.bookSeeder();
    await seeder.paymentTypeSeeder();
    await seeder.orderSeeder();
    await seeder.cartSeeder();
};
