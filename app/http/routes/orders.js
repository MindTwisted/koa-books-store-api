const Router = require('koa-router');
const router = new Router({ prefix: '/orders' });
const orderController = require('@controllers/order');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');
// const isAdminMiddleware = require('@middlewares/isAdmin');

router.post('/', isLoggedInMiddleware, orderController.store);

module.exports = router;
