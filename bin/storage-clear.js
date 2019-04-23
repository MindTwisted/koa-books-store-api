require('module-alias/register');

const fs = require('fs');
const inquirer = require('inquirer');
const storageService = require('@services/storage/local');
const makeConnection = require('@database/connection');
const Book = require('@models/book');

const clearBookImages = async () => {
    const books = await Book.find({ image: { $ne: null } });
    const bookImageNames = books.map(book => book.image.match(/(\w+\.\w+)/)[0]);
    const folderPath = storageService.getPath(null, 'image', 'books').folderPath;

    fs.readdirSync(folderPath).map(fileName => {
        if (!bookImageNames.includes(fileName)) {
            fs.unlinkSync(`${folderPath}/${fileName}`);
        }
    });
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
