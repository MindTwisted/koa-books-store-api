const fs = require('fs');
const Koa = require('koa');
const app = new Koa();
const morgan = require('koa-morgan');
const bodyParser = require('koa-body');
const send = require('koa-send');
const router = require('@routes/index');
const accessLogStream = fs.createWriteStream(process.cwd() + '/logs/access.log', { flags: 'a' });

app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyParser({ multipart: true }));
app.use(router.routes());
app.use(router.allowedMethods());
app.use(async ctx => {
    await send(ctx, ctx.path, { root: __dirname + '/../public' });
});

// TODO: add readme with install app guide and code tests coverage badge

module.exports = app;
