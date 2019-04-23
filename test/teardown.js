const rimraf = require('rimraf');
const config = require('@config/config');
const publicDir = config.PUBLIC_DIRNAME;
const storageDir = config.STORAGE_DIRNAME;

module.exports = async () => {
    await global.connection.connections[0].db.dropDatabase();

    return new Promise((resolve, reject) => {
        rimraf(`${process.cwd()}/${publicDir}/${storageDir}`, { disableGlob: true }, err => {
            if (err) {
                reject(err);
            }

            resolve();
        });
    });
};
