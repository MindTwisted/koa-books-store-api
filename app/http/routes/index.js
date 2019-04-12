const Router = require('koa-router');
const router = new Router({ prefix: '/api' });
const jsonView = require('@views/json');
const errorHandleMiddleware = require('@middlewares/errorHandle');
const authenticationMiddleware = require('@middlewares/authentication');
const authRouter = require('@routes/auth');
const authorsRouter = require('@routes/authors');

router.use(jsonView);
router.use(errorHandleMiddleware);
router.use(authenticationMiddleware);

router.use(authRouter.routes(), authRouter.allowedMethods());
router.use(authorsRouter.routes(), authorsRouter.allowedMethods());

module.exports = router;
