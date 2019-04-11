const path = require('path');
const dotenv = require('dotenv');
const env = process.env.NODE_ENV;

const config = dotenv.config({
    path:
        env === 'testing'
            ? path.resolve(process.cwd(), '.env.testing')
            : path.resolve(process.cwd(), '.env.development'),
});

module.exports = config.parsed;
