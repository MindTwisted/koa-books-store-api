const Router = require('koa-router');
const router = new Router({ prefix: '/api' });
const errorHandleMiddleware = require('@middlewares/errorHandle');
const loginMiddleware = require('@middlewares/login');
const authenticationMiddleware = require('@middlewares/authentication');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');
const authController = require('@controllers/auth');
const authorController = require('@controllers/author');
const jsonView = require('@views/json');

router.use(jsonView);
router.use(errorHandleMiddleware);
router.use(authenticationMiddleware);

router.post('/auth', authController.register);
router.put('/auth', loginMiddleware, authController.login);
router.get('/auth', isLoggedInMiddleware, authController.current);

router.get('/authors', authorController.index);

module.exports = router;
