const Router = require('koa-router');
const router = new Router({ prefix: '/authors' });
const authorController = require('@controllers/author');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');
const isAdminMiddleware = require('@middlewares/isAdmin');

/**
 *
 * @api {GET} /api/authors?offset=10&search=abc All authors
 * @apiName AuthorsIndex
 * @apiGroup Authors
 * @apiVersion  1.0.0
 *
 *
 * @apiParam  {Number} offset Number of results to skip
 * @apiParam  {String} search Text to search with
 *
 *
 */
router.get('/', authorController.index);

/**
 *
 * @api {GET} /api/authors/:id Single author
 * @apiName AuthorsShow
 * @apiGroup Authors
 * @apiVersion  1.0.0
 *
 *
 * @apiParam  {String} id Author's database identifier
 *
 *
 */
router.get('/:id', authorController.show);

/**
 *
 * @api {GET} /api/authors/:id/books?offset=10 Books of author
 * @apiName AuthorsShowBooks
 * @apiGroup Authors
 * @apiVersion  1.0.0
 *
 *
 * @apiParam  {String} id Author's database identifier
 * @apiParam  {Number} offset Number of results to skip
 *
 *
 */
router.get('/:id/books', authorController.showBooks);

/**
 *
 * @api {POST} /api/authors Create author
 * @apiName AuthorsStore
 * @apiGroup Authors
 * @apiVersion  1.0.0
 * @apiPermission IsAdmin
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 * @apiParam  {String{6..}} name New name
 *
 *
 */
router.post('/', isLoggedInMiddleware, isAdminMiddleware, authorController.store);

/**
 *
 * @api {PUT} /api/authors/:id Update author
 * @apiName AuthorsUpdate
 * @apiGroup Authors
 * @apiVersion  1.0.0
 * @apiPermission IsAdmin
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 * @apiParam  {String{6..}} name Updated name
 *
 *
 */
router.put('/:id', isLoggedInMiddleware, isAdminMiddleware, authorController.update);

/**
 *
 * @api {DELETE} /api/authors/:id Delete author
 * @apiName AuthorsDestroy
 * @apiGroup Authors
 * @apiVersion  1.0.0
 * @apiPermission IsAdmin
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 */
router.delete('/:id', isLoggedInMiddleware, isAdminMiddleware, authorController.destroy);

module.exports = router;
