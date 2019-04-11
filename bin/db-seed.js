require('module-alias/register');

const inquirer = require('inquirer');
const seeder = require('@database/seeders');

inquirer
    .prompt([
        {
            type: 'confirm',
            name: 'toSeedDatabase',
            message: 'This command will seed database with random data. Do you want to continue?',
            default: false,
        },
    ])
    .then(answers => {
        if (!answers.toSeedDatabase) {
            // eslint-disable-next-line no-console
            console.log('Database was not seeded.');

            process.exit(0);
        }

        const connection = require('@database/connection');

        return connection;
    })
    .then(async () => {
        await seeder.authorSeeder();
    })
    .then(() => {
        // eslint-disable-next-line no-console
        console.log('Database was seeded.');

        process.exit(0);
    })
    .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);

        process.exit(1);
    });
