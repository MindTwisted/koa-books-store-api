const Router = require('koa-router');
const router = new Router({ prefix: '/payment-types' });
const paymentTypeController = require('@controllers/paymentType');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');

/**
 *
 * @api {GET} /api/payment-types All payment types
 * @apiName PaymentTypesIndex
 * @apiGroup PaymentTypes
 * @apiVersion  1.0.0
 *
 *
 *
 */
router.get('/', isLoggedInMiddleware, paymentTypeController.index);

module.exports = router;
