const Koa = require('koa');
const app = new Koa();
const bodyParser = require('koa-body');
const send = require('koa-send');
const router = require('@routes/index');

app.use(bodyParser({ multipart: true }));
app.use(router.routes());
app.use(router.allowedMethods());
app.use(async ctx => {
    await send(ctx, ctx.path, { root: __dirname + '/../public' });
});

module.exports = app;
