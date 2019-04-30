const faker = require('faker');
const User = require('@models/user');
const Book = require('@models/book');
const Cart = require('@models/cart');

const seeder = async () => {
    const users = await User.find({}).lean();
    const books = await Book.find({}).lean();

    return Cart.create(
        Array.from(Array(100)).map(() => {
            return {
                count: faker.random.number({ min: 1, max: 20 }),
                user: faker.random.arrayElement(users)._id,
                book: faker.random.arrayElement(books)._id,
            };
        }),
    );
};

module.exports = seeder;
