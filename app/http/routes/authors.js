const Router = require('koa-router');
const router = new Router({ prefix: '/authors' });
const authorController = require('@controllers/author');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');
const isAdminMiddleware = require('@middlewares/isAdmin');

router.get('/', authorController.index);
router.get('/:id', authorController.show);
router.get('/:id/books', authorController.showBooks);
router.post('/', isLoggedInMiddleware, isAdminMiddleware, authorController.store);
router.put('/:id', isLoggedInMiddleware, isAdminMiddleware, authorController.update);
router.delete('/:id', isLoggedInMiddleware, isAdminMiddleware, authorController.destroy);

module.exports = router;
