const fs = require('fs');
const Koa = require('koa');
const app = new Koa();
const morgan = require('koa-morgan');
const bodyParser = require('koa-body');
const send = require('koa-send');
const cors = require('@koa/cors');
const router = require('@routes/index');
const accessLogStream = fs.createWriteStream(process.cwd() + '/logs/access.log', { flags: 'a' });

app.use(morgan('combined', { stream: accessLogStream }));
app.use(cors());
app.use(bodyParser({ multipart: true }));
app.use(router.routes());
app.use(router.allowedMethods());
app.use(async ctx => {
    await send(ctx, ctx.path, { root: __dirname + '/../public' });
});

module.exports = app;
