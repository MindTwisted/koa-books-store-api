const faker = require('faker');
const { generateUniqueValues } = require('@utils');
const User = require('@models/user');
const Book = require('@models/book');
const Cart = require('@models/cart');

const seeder = async () => {
    const users = await User.find({}).lean();
    const books = await Book.find({}).lean();
    const uniquePairs = generateUniqueValues(
        100,
        () => faker.random.arrayElement(users)._id + '===' + faker.random.arrayElement(books)._id,
    );

    return Cart.create(
        uniquePairs.map(pair => {
            const splitPair = pair.split('===');

            return {
                count: faker.random.number({ min: 1, max: 20 }),
                user: splitPair[0],
                book: splitPair[1],
            };
        }),
    );
};

module.exports = seeder;
