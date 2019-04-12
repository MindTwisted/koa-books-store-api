const Router = require('koa-router');
const router = new Router({ prefix: '/auth' });
const loginMiddleware = require('@middlewares/login');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');
const authController = require('@controllers/auth');

router.post('/', authController.register);
router.put('/', loginMiddleware, authController.login);
router.get('/', isLoggedInMiddleware, authController.current);

module.exports = router;
