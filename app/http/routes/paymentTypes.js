const Router = require('koa-router');
const router = new Router({ prefix: '/payment-types' });
const paymentTypeController = require('@controllers/paymentType');

router.get('/', paymentTypeController.index);

module.exports = router;
