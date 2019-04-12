const User = require('@models/user');

const seeder = () => {
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
    );
};

module.exports = seeder;
