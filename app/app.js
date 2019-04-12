const Koa = require('koa');
const app = new Koa();
const bodyParser = require('koa-bodyparser');
const router = require('@routes/index');

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
