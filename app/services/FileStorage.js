const fs = require('fs');
const util = require('util');
const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);
const unlink = util.promisify(fs.unlink);
const config = require('@config/config');
const publicDir = config.PUBLIC_DIRNAME;
const storageDir = config.STORAGE_DIRNAME;
const storages = {};

const createDirIfNotExists = async dirPath => {
    try {
        await stat(dirPath);
    } catch (error) {
        await mkdir(dirPath, { recursive: true });
    }
};

class FileStorage {
    static async createStorage(path) {
        const absPath = `${process.cwd()}/${publicDir}/${storageDir}/${path}`;
        const publicPath = `${storageDir}/${path}`;

        await createDirIfNotExists(absPath);

        storages[path] = new FileStorage(absPath, publicPath);
    }

    static getStorage(path) {
        return storages[path];
    }

    constructor(absPath, publicPath) {
        this.absPath = absPath;
        this.publicPath = publicPath;
    }

    insert(name, readStream) {
        const filePath = `${this.absPath}/${name}`;
        const writeStream = fs.createWriteStream(filePath);
        const stream = readStream.pipe(writeStream);

        return new Promise((resolve, reject) => {
            stream.on('finish', () => {
                resolve();
            });

            stream.on('error', () => {
                reject();
            });
        });
    }

    async delete(name) {
        await unlink(`${this.absPath}/${name}`);
    }

    getPublicPath(name) {
        if (name) {
            return `${this.publicPath}/${name}`;
        }

        return this.publicPath;
    }

    getAbsPath(name) {
        if (name) {
            return `${this.absPath}/${name}`;
        }

        return this.absPath;
    }
}

module.exports = FileStorage;
