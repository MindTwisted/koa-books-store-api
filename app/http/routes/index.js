const Router = require('koa-router');
const router = new Router({ prefix: '/api' });
const jsonView = require('@views/json');
const errorHandleMiddleware = require('@middlewares/errorHandle');
const authenticationMiddleware = require('@middlewares/authentication');
const authRouter = require('@routes/auth');
const authorsRouter = require('@routes/authors');
const genresRouter = require('@routes/genres');
const booksRouter = require('@routes/books');
const usersRouter = require('@routes/users');

router.use(jsonView);
router.use(errorHandleMiddleware);
router.use(authenticationMiddleware);

router.use(authRouter.routes(), authRouter.allowedMethods());
router.use(authorsRouter.routes(), authorsRouter.allowedMethods());
router.use(genresRouter.routes(), genresRouter.allowedMethods());
router.use(booksRouter.routes(), booksRouter.allowedMethods());
router.use(usersRouter.routes(), usersRouter.allowedMethods());

module.exports = router;
