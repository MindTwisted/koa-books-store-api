const faker = require('faker');
const { generateUniqueValues } = require('@utils');
const Author = require('@models/author');
const Genre = require('@models/genre');
const Book = require('@models/book');

const seeder = async () => {
    const bookTitles = generateUniqueValues(1000, () => faker.lorem.words(5));
    const authors = await Author.find({}).lean();
    const genres = await Genre.find({}).lean();

    return Book.create(
        bookTitles.map(title => {
            return {
                title,
                description: faker.lorem.words(20),
                price: faker.random.number({ min: 30, max: 100 }),
                discount: faker.random.number({ min: 0, max: 50 }),
                image: faker.random.image(),
                authors: generateUniqueValues(2, () => faker.random.arrayElement(authors)._id),
                genres: generateUniqueValues(3, () => faker.random.arrayElement(genres)._id),
            };
        }),
    );
};

module.exports = seeder;
