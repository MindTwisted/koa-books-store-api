const Router = require('koa-router');
const router = new Router({ prefix: '/users' });
const userController = require('@controllers/user');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');
const isAdminMiddleware = require('@middlewares/isAdmin');

router.get('/', isLoggedInMiddleware, isAdminMiddleware, userController.index);
router.get('/:id', isLoggedInMiddleware, isAdminMiddleware, userController.show);
router.get('/:id/orders', isLoggedInMiddleware, isAdminMiddleware, userController.showOrders);
router.put('/:id', isLoggedInMiddleware, isAdminMiddleware, userController.update);
router.put('/', isLoggedInMiddleware, userController.updateCurrent);

module.exports = router;
