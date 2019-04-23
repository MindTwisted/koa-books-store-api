const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);
const faker = require('faker');
const mime = require('mime');
const config = require('@config/config');
const UploadError = require('@errors/UploadError');
const publicDir = config.PUBLIC_DIRNAME;
const storageDir = config.STORAGE_DIRNAME;

const validateUpload = (file, type) => {
    const imageTypes = ['image/jpeg'];
    const imageMaxSize = 5242880;

    const result = { status: 'success', errors: [] };

    switch (type) {
        case 'image':
            if (!imageTypes.includes(file.type)) {
                result.status = 'failed';
                result.errors.push(`Invalid image type ${file.type}`);
            }

            if (file.size > imageMaxSize) {
                result.status = 'failed';
                result.errors.push(`Image is too big. Maximum size is ${imageMaxSize} bytes.`);
            }

            break;
    }

    return result;
};

const getFilePath = (fileName, type, folderName) => {
    const result = {};

    switch (type) {
        case 'image':
            result.publicPath = `${storageDir}/images/${folderName}/${fileName}`;
            result.savePath = `${process.cwd()}/${publicDir}/${result.publicPath}`;
            result.folderPath = `${process.cwd()}/${publicDir}/${storageDir}/images/${folderName}`;

            break;
    }

    return result;
};

const saveFile = async (file, type, folderName) => {
    const fileName = `${faker.random.alphaNumeric(20)}.${mime.getExtension(file.type)}`;
    const filePath = getFilePath(fileName, type, folderName);
    const fileData = await readFile(file.path);

    try {
        await stat(filePath.folderPath);
    } catch (error) {
        await mkdir(filePath.folderPath, { recursive: true });
    }

    await writeFile(filePath.savePath, fileData);

    return filePath.publicPath;
};

module.exports = {
    store(file, { type = 'image', folderName = '', fieldName = 'file' }) {
        if (!file) {
            return null;
        }

        const validator = validateUpload(file, type);

        if (validator.status === 'failed') {
            throw new UploadError(`File validation failed for type ${type}`, {
                fieldName,
                errors: validator.errors,
            });
        }

        return saveFile(file, type, folderName);
    },
    getPath(fileName, type, folderName) {
        return getFilePath(fileName, type, folderName);
    },
};
