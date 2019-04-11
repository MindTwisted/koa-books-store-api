const faker = require('faker');
const { generateUniqueValues } = require('@utils');
const Author = require('@models/author');

const authorSeeder = () => {
    return Author.create(
        generateUniqueValues(100, () => {
            return faker.name.firstName() + ' ' + faker.name.lastName();
        }).map(name => {
            return { name };
        }),
    );
};

module.exports = authorSeeder;
