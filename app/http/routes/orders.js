const Router = require('koa-router');
const router = new Router({ prefix: '/orders' });
const orderController = require('@controllers/order');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');
const isAdminMiddleware = require('@middlewares/isAdmin');

/**
 *
 * @api {GET} /api/orders?offset=10&user=5ccb137d3e4d3a2290eca641 All orders
 * @apiName OrdersIndex
 * @apiGroup Orders
 * @apiVersion  1.0.0
 * @apiPermission IsAdmin
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 * @apiParam  {Number} offset Number of results to skip
 * @apiParam  {String} user User's database identifier
 *
 */
router.get('/', isLoggedInMiddleware, isAdminMiddleware, orderController.index);

/**
 *
 * @api {GET} /api/orders/current?offset=10 All orders of current user
 * @apiName OrdersIndexCurrent
 * @apiGroup Orders
 * @apiVersion  1.0.0
 * @apiPermission IsLoggedIn
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 * @apiParam  {Number} offset Number of results to skip
 *
 */
router.get('/current', isLoggedInMiddleware, orderController.indexCurrent);

/**
 *
 * @api {POST} /api/orders Create order
 * @apiName OrdersStore
 * @apiGroup Orders
 * @apiVersion  1.0.0
 * @apiPermission IsLoggedIn
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 * @apiParam  {String} paymentType Database identifier of payment type
 *
 */
router.post('/', isLoggedInMiddleware, orderController.store);

/**
 *
 * @api {PUT} /api/orders/:id Update order
 * @apiName OrdersUpdate
 * @apiGroup Orders
 * @apiVersion  1.0.0
 * @apiPermission IsAdmin
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 * @apiParam  {String} id Order's database identifier
 * @apiParam  {String="in_progress", "done"} status Order status
 *
 */
router.put('/:id', isLoggedInMiddleware, isAdminMiddleware, orderController.update);

/**
 *
 * @api {PUT} /api/orders/:id Delete order
 * @apiName OrdersDestroy
 * @apiGroup Orders
 * @apiVersion  1.0.0
 * @apiPermission IsAdmin
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 * @apiParam  {String} id Order's database identifier
 *
 */
router.delete('/:id', isLoggedInMiddleware, isAdminMiddleware, orderController.destroy);

module.exports = router;
