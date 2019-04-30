const Router = require('koa-router');
const router = new Router({ prefix: '/cart' });
const cartController = require('@controllers/cart');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');

router.get('/', isLoggedInMiddleware, cartController.index);
router.post('/', isLoggedInMiddleware, cartController.store);
router.put('/:id', isLoggedInMiddleware, cartController.update);
router.delete('/:id', isLoggedInMiddleware, cartController.destroy);

module.exports = router;
