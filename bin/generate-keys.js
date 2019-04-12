const fs = require('fs');
const inquirer = require('inquirer');
const NodeRSA = require('node-rsa');
const pd = process.platform === 'win32' ? '\\' : '/';

const run = async () => {
    try {
        const answers = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'toGenerateKeys',
                message: 'This command will generate new security keys. Do you want to continue?',
                default: false,
            },
        ]);

        if (!answers.toGenerateKeys) {
            // eslint-disable-next-line no-console
            console.log('Security keys were not generated.');

            process.exit(0);
        }

        const key = new NodeRSA({ b: 512 });
        const privateKey = key.exportKey('pkcs8-private');
        const publicKey = key.exportKey('pkcs8-public');

        fs.writeFileSync('private.key', privateKey);
        // eslint-disable-next-line no-console
        console.log(`${process.cwd()}${pd}private.key was successfully generated.`);

        fs.writeFileSync('public.key', publicKey);
        // eslint-disable-next-line no-console
        console.log(`${process.cwd()}${pd}public.key was successfully generated.`);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        process.exit(1);
    }
};

run();
