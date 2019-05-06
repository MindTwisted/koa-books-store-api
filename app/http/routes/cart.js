const Router = require('koa-router');
const router = new Router({ prefix: '/cart' });
const cartController = require('@controllers/cart');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');

/**
 *
 * @api {GET} /api/cart Cart of current user
 * @apiName CartIndex
 * @apiGroup Cart
 * @apiVersion  1.0.0
 * @apiPermission IsLoggedIn
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 */
router.get('/', isLoggedInMiddleware, cartController.index);

/**
 *
 * @api {POST} /api/cart Add item to cart of current user
 * @apiName CartStore
 * @apiGroup Cart
 * @apiVersion  1.0.0
 * @apiPermission IsLoggedIn
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 * @apiParam  {Number{0}} count Count of books to add
 * @apiParam  {String} book Book's database identifier
 *
 */
router.post('/', isLoggedInMiddleware, cartController.store);

/**
 *
 * @api {PUT} /api/cart/:id Update item in the cart of current user
 * @apiName CartUpdate
 * @apiGroup Cart
 * @apiVersion  1.0.0
 * @apiPermission IsLoggedIn
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 * @apiParam  {String} id Cart's database identifier
 * @apiParam  {Number{0}} count Count of books in cart
 *
 */
router.put('/:id', isLoggedInMiddleware, cartController.update);

/**
 *
 * @api {DELETE} /api/cart/:id Delete item from the cart of current user
 * @apiName CartDestroy
 * @apiGroup Cart
 * @apiVersion  1.0.0
 * @apiPermission IsLoggedIn
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 * @apiParam  {String} id Cart's database identifier
 *
 */
router.delete('/:id', isLoggedInMiddleware, cartController.destroy);

module.exports = router;
