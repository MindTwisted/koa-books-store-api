require('module-alias/register');

const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const inquirer = require('inquirer');
const FileStorage = require('@services/FileStorage');
const makeConnection = require('@database/connection');
const Book = require('@models/book');

const clearBookImages = async () => {
    await FileStorage.createStorage('images/books');

    const bookImageStorage = FileStorage.getStorage('images/books');
    const books = await Book.find({ image: { $ne: null } });
    const bookImageNames = books.map(book => book.image.name);
    const folderPath = bookImageStorage.getAbsPath();
    const folderContent = await readdir(folderPath);
    const deletePromises = folderContent.map(fileName => {
        if (!bookImageNames.includes(fileName)) {
            return bookImageStorage.delete(fileName);
        }
    });

    return Promise.all(deletePromises);
};

const run = async () => {
    try {
        const answers = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'toClearStorage',
                message: 'This command will clear storage. Do you want to continue?',
                default: false,
            },
        ]);

        if (!answers.toClearStorage) {
            // eslint-disable-next-line no-console
            console.log('Storage was not cleared.');

            process.exit(0);
        }

        await makeConnection();
        await clearBookImages();

        // eslint-disable-next-line no-console
        console.log('Storage was cleared.');

        process.exit(0);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        process.exit(1);
    }
};

run();
