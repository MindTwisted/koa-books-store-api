const Router = require('koa-router');
const router = new Router({ prefix: '/books' });
const bookController = require('@controllers/book');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');
const isAdminMiddleware = require('@middlewares/isAdmin');

router.get('/', bookController.index);
router.get('/:id', bookController.show);
router.post('/', isLoggedInMiddleware, isAdminMiddleware, bookController.store);
router.put('/:id', isLoggedInMiddleware, isAdminMiddleware, bookController.update);
router.delete('/:id', isLoggedInMiddleware, isAdminMiddleware, bookController.destroy);

module.exports = router;
