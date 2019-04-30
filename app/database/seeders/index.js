const userSeeder = require('@database/seeders/users');
const authorSeeder = require('@database/seeders/authors');
const genreSeeder = require('@database/seeders/genres');
const bookSeeder = require('@database/seeders/books');
const cartSeeder = require('@database/seeders/cart');

module.exports = {
    userSeeder,
    authorSeeder,
    genreSeeder,
    bookSeeder,
    cartSeeder,
};
