const Router = require('koa-router');
const router = new Router({ prefix: '/genres' });
const genreController = require('@controllers/genre');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');
const isAdminMiddleware = require('@middlewares/isAdmin');

router.get('/', genreController.index);
router.get('/:id', genreController.show);
router.get('/:id/books', genreController.showBooks);
router.post('/', isLoggedInMiddleware, isAdminMiddleware, genreController.store);
router.put('/:id', isLoggedInMiddleware, isAdminMiddleware, genreController.update);
router.delete('/:id', isLoggedInMiddleware, isAdminMiddleware, genreController.destroy);

module.exports = router;
