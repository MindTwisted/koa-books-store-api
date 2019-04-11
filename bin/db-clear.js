require('module-alias/register');

const inquirer = require('inquirer');

inquirer
    .prompt([
        {
            type: 'confirm',
            name: 'toClearDatabase',
            message: 'This command will clear database. Do you want to continue?',
            default: false,
        },
    ])
    .then(answers => {
        if (!answers.toClearDatabase) {
            // eslint-disable-next-line no-console
            console.log('Database was not cleared.');

            process.exit(0);
        }

        const connection = require('@database/connection');

        return connection;
    })
    .then(connection => {
        return connection.connections[0].db.dropDatabase();
    })
    .then(() => {
        // eslint-disable-next-line no-console
        console.log('Database was cleared.');

        process.exit(0);
    })
    .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);

        process.exit(1);
    });
