const Router = require('koa-router');
const router = new Router({ prefix: '/api' });
const errorHandleMiddleware = require('@middlewares/errorHandle');
const loginMiddleware = require('@middlewares/login');
const authController = require('@controllers/auth');
const jsonView = require('@views/json');

router.use(jsonView);

router.post('/auth', authController.register);
router.put('/auth', loginMiddleware, authController.login);

router.use(errorHandleMiddleware);

module.exports = router;
