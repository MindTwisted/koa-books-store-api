const faker = require('faker');
const { generateUniqueValues } = require('@utils');
const User = require('@models/user');
const Book = require('@models/book');
const Cart = require('@models/cart');
const PaymentType = require('@models/paymentType');
const OrderService = require('@services/OrderService');

const seeder = async () => {
    const users = await User.find({}).lean();
    const books = await Book.find({}).lean();
    const paymentTypes = await PaymentType.find({}).lean();
    const uniquePairs = generateUniqueValues(
        100,
        () => faker.random.arrayElement(users)._id + '===' + faker.random.arrayElement(books)._id,
    );
    const splitUniquePairs = uniquePairs.map(pair => {
        const splitPair = pair.split('===');

        return {
            user: splitPair[0],
            book: splitPair[1],
        };
    });

    await Cart.create(
        splitUniquePairs.map(pair => {
            return {
                count: faker.random.number({ min: 1, max: 20 }),
                user: pair.user,
                book: pair.book,
            };
        }),
    );

    const createOrderPromises = [];
    const uniqueUsersWithCart = [...new Set(splitUniquePairs.map(pair => pair.user.toString()))];

    uniqueUsersWithCart.map(userId => {
        const user = users.find(user => user._id == userId);
        const orderService = new OrderService(user, faker.random.arrayElement(paymentTypes)._id);

        createOrderPromises.push(orderService.save());
    });

    return Promise.all(createOrderPromises);
};

module.exports = seeder;
