const Router = require('koa-router');
const router = new Router({ prefix: '/cart' });
const cartController = require('@controllers/cart');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');

router.get('/', isLoggedInMiddleware, cartController.index);
router.post('/', isLoggedInMiddleware, cartController.store);

module.exports = router;
