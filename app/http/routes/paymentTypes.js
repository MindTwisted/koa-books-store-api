const Router = require('koa-router');
const router = new Router({ prefix: '/payment-types' });
const paymentTypeController = require('@controllers/paymentType');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');

router.get('/', isLoggedInMiddleware, paymentTypeController.index);

module.exports = router;
