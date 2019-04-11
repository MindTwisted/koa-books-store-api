const Koa = require('koa');
const app = new Koa();
const bodyParser = require('koa-bodyparser');
const apiRouter = require('@routes/api');

app.use(bodyParser());
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

module.exports = app;
