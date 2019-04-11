require('module-alias/register');

const connection = require('@database/connection');
const app = require('@root/app/app');
const config = require('@config/config');

connection
    .then(() => {
        app.listen(config.SERVER_PORT);
    })
    .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
    });
