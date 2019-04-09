require('module-alias/register');
require('dotenv').config();

const Koa = require('koa');
const app = new Koa();
const bodyParser = require('koa-bodyparser');
const apiRouter = require('@routes/api');
const connection = require('@database/connection');

connection();

app.use(bodyParser());
app.use(apiRouter.routes());

app.listen(3000);
