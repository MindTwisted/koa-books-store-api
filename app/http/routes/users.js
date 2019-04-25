const Router = require('koa-router');
const router = new Router({ prefix: '/users' });
const userController = require('@controllers/user');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');
const isAdminMiddleware = require('@middlewares/isAdmin');

router.get('/', isLoggedInMiddleware, isAdminMiddleware, userController.index);

module.exports = router;
