const path = require('path');
const dotenv = require('dotenv');
const Koa = require('koa');
const app = new Koa();
const bodyParser = require('koa-bodyparser');
const apiRouter = require('@routes/api');

dotenv.config({
    path:
        process.env.NODE_ENV === 'testing'
            ? path.resolve(process.cwd(), '.env.testing')
            : path.resolve(process.cwd(), '.env'),
});

require('@database/connection');

app.use(bodyParser());
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

module.exports = app;
