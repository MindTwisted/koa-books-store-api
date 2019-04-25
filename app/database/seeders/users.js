const faker = require('faker');
const User = require('@models/user');
const { generateUniqueValues } = require('@utils');

const seeder = () => {
    const uniqueEmails = generateUniqueValues(48, () => {
        return faker.internet.exampleEmail();
    });
    const randomUsers = uniqueEmails.map(email => {
        return {
            name: faker.name.firstName() + ' ' + faker.name.lastName(),
            email,
            password: faker.random.alphaNumeric(10),
        };
    });

    return User.create(
        {
            name: 'John Walker',
            email: 'john@example.com',
            password: 'secret',
            role: 'admin',
        },
        {
            name: 'William Smith',
            email: 'smith@example.com',
            password: 'secret',
        },
        ...randomUsers,
    );
};

module.exports = seeder;
