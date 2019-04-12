require('module-alias/register');

const inquirer = require('inquirer');
const makeConnection = require('@database/connection');
const seeder = require('@database/seeders');

const run = async () => {
    try {
        const answers = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'toSeedDatabase',
                message: 'This command will seed database with random data. Do you want to continue?',
                default: false,
            },
        ]);

        if (!answers.toSeedDatabase) {
            // eslint-disable-next-line no-console
            console.log('Database was not seeded.');

            process.exit(0);
        }

        await makeConnection();
        await seeder.authorSeeder();

        // eslint-disable-next-line no-console
        console.log('Database was seeded.');

        process.exit(0);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        process.exit(1);
    }
};

run();
