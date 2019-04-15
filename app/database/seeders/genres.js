const faker = require('faker');
const { generateUniqueValues } = require('@utils');
const Genre = require('@models/genre');

const seeder = () => {
    return Genre.create(
        generateUniqueValues(100, () => {
            return faker.lorem.words(3);
        }).map(name => {
            return { name };
        }),
    );
};

module.exports = seeder;
