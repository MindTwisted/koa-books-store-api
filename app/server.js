require('module-alias/register');

const makeConnection = require('@database/connection');
const app = require('@root/app/app');
const config = require('@config/config');

const startServer = async () => {
    try {
        await makeConnection();

        app.listen(config.SERVER_PORT);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }
};

startServer();
