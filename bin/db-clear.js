require('module-alias/register');

const inquirer = require('inquirer');
const makeConnection = require('@database/connection');

const run = async () => {
    try {
        const answers = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'toClearDatabase',
                message: 'This command will clear database. Do you want to continue?',
                default: false,
            },
        ]);

        if (!answers.toClearDatabase) {
            // eslint-disable-next-line no-console
            console.log('Database was not cleared.');

            process.exit(0);
        }

        const connection = await makeConnection();

        await connection.connections[0].db.dropDatabase();

        // eslint-disable-next-line no-console
        console.log('Database was cleared.');

        process.exit(0);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        process.exit(1);
    }
};

run();
