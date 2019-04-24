require('module-alias/register');

const makeConnection = require('@database/connection');
const FileStorage = require('@services/FileStorage');
const app = require('@root/app/app');
const config = require('@config/config');

const startServer = async () => {
    try {
        await makeConnection();
        await FileStorage.createStorage('images/books');

        app.listen(config.SERVER_PORT);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }
};

startServer();
