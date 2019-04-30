const faker = require('faker');
const { generateUniqueValues } = require('@utils');
const PaymentType = require('@models/paymentType');

const seeder = () => {
    return PaymentType.create(
        generateUniqueValues(10, () => {
            return faker.random.words(3);
        }).map(name => {
            return { name };
        }),
    );
};

module.exports = seeder;
