const faker = require('faker');
const { generateUniqueValues } = require('@utils');
const Author = require('@models/author');

const seeder = () => {
    return Author.create(
        generateUniqueValues(100, () => {
            return faker.name.firstName() + ' ' + faker.name.lastName();
        }).map(name => {
            return { name };
        }),
    );
};

module.exports = seeder;
