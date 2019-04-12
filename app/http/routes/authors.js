const Router = require('koa-router');
const router = new Router({ prefix: '/authors' });
const authorController = require('@controllers/author');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');
const isAdminMiddleware = require('@middlewares/isAdmin');

router.get('/', authorController.index);
router.get('/:id', authorController.show);
router.post('/', isLoggedInMiddleware, isAdminMiddleware, authorController.store);

module.exports = router;
