const Router = require('koa-router');
const router = new Router({ prefix: '/api' });
const jsonView = require('@views/json');
const errorHandleMiddleware = require('@middlewares/errorHandle');
const authenticationMiddleware = require('@middlewares/authentication');
const authRouter = require('@routes/auth');
const authorsRouter = require('@routes/authors');
const genresRouter = require('@routes/genres');

router.use(jsonView);
router.use(errorHandleMiddleware);
router.use(authenticationMiddleware);

router.use(authRouter.routes(), authRouter.allowedMethods());
router.use(authorsRouter.routes(), authorsRouter.allowedMethods());
router.use(genresRouter.routes(), genresRouter.allowedMethods());

module.exports = router;
