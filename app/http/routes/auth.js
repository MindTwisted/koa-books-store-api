const Router = require('koa-router');
const router = new Router({ prefix: '/auth' });
const loginMiddleware = require('@middlewares/login');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');
const authController = require('@controllers/auth');

/**
 *
 * @api {POST} /api/auth Register user
 * @apiName AuthRegister
 * @apiGroup Auth
 * @apiVersion  1.0.0
 *
 *
 * @apiParam  {String{6..}} name New user's name
 * @apiParam  {String} email New user's email
 * @apiParam  {String{6..}} password New user's password
 *
 *
 */
router.post('/', authController.register);

/**
 *
 * @api {PUT} /api/auth Login user
 * @apiName AuthLogin
 * @apiGroup Auth
 * @apiVersion  1.0.0
 *
 *
 * @apiParam  {String} email User's email
 * @apiParam  {String{6..}} password User's password
 *
 *
 */
router.put('/', loginMiddleware, authController.login);

/**
 *
 * @api {GET} /api/auth Auth info
 * @apiName AuthCurrent
 * @apiGroup Auth
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
router.get('/', isLoggedInMiddleware, authController.current);

module.exports = router;
