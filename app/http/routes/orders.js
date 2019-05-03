const Router = require('koa-router');
const router = new Router({ prefix: '/orders' });
const orderController = require('@controllers/order');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');
const isAdminMiddleware = require('@middlewares/isAdmin');

router.get('/', isLoggedInMiddleware, isAdminMiddleware, orderController.index);
router.get('/current', isLoggedInMiddleware, orderController.indexCurrent);
router.post('/', isLoggedInMiddleware, orderController.store);
router.put('/:id', isLoggedInMiddleware, isAdminMiddleware, orderController.update);
router.delete('/:id', isLoggedInMiddleware, isAdminMiddleware, orderController.destroy);

module.exports = router;
