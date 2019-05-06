const Router = require('koa-router');
const router = new Router({ prefix: '/users' });
const userController = require('@controllers/user');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');
const isAdminMiddleware = require('@middlewares/isAdmin');

/**
 *
 * @api {GET} /api/users?offset=10&name=abc&email=john@example.com All users
 * @apiName UsersIndex
 * @apiGroup Users
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
 * @apiParam  {String} name Name to search with
 * @apiParam  {String} email Email to search with
 *
 */
router.get('/', isLoggedInMiddleware, isAdminMiddleware, userController.index);

/**
 *
 * @api {GET} /api/users/:id Single user
 * @apiName UsersShow
 * @apiGroup Users
 * @apiVersion  1.0.0
 * @apiPermission IsAdmin
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 * @apiParam  {String} id User's database identifier
 *
 */
router.get('/:id', isLoggedInMiddleware, isAdminMiddleware, userController.show);

/**
 *
 * @api {GET} /api/users/:id/orders?offset=10 Orders by user
 * @apiName UsersShowOrders
 * @apiGroup Users
 * @apiVersion  1.0.0
 * @apiPermission IsAdmin
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 * @apiParam  {String} id User's database identifier
 * @apiParam  {Number} offset Number of results to skip
 *
 */
router.get('/:id/orders', isLoggedInMiddleware, isAdminMiddleware, userController.showOrders);

/**
 *
 * @api {PUT} /api/users/:id Update user
 * @apiName UsersUpdate
 * @apiGroup Users
 * @apiVersion  1.0.0
 * @apiPermission IsAdmin
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 * @apiParam  {String} name Updated user's name
 * @apiParam  {String} email Updated user's email
 * @apiParam  {Number{0-50}} discount Updated user's discount
 *
 */
router.put('/:id', isLoggedInMiddleware, isAdminMiddleware, userController.update);

/**
 *
 * @api {PUT} /api/users Update current user
 * @apiName UsersUpdateCurrent
 * @apiGroup Users
 * @apiVersion  1.0.0
 * @apiPermission IsLoggedIn
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 * @apiParam  {String} name Updated user's name
 * @apiParam  {String} email Updated user's email
 * @apiParam  {String} password Updated user's password
 *
 */
router.put('/', isLoggedInMiddleware, userController.updateCurrent);

module.exports = router;
