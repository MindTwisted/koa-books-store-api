const Router = require('koa-router');
const router = new Router({ prefix: '/genres' });
const genreController = require('@controllers/genre');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');
const isAdminMiddleware = require('@middlewares/isAdmin');

/**
 *
 * @api {GET} /api/genres?offset=10&search=abc All genres
 * @apiName GenresIndex
 * @apiGroup Genres
 * @apiVersion  1.0.0
 *
 *
 * @apiParam  {Number} offset Number of results to skip
 * @apiParam  {String} search Text to search with
 *
 *
 */
router.get('/', genreController.index);

/**
 *
 * @api {GET} /api/genres/:id Single genre
 * @apiName GenresShow
 * @apiGroup Genres
 * @apiVersion  1.0.0
 *
 *
 * @apiParam  {String} id Genre's database identifier
 *
 *
 */
router.get('/:id', genreController.show);

/**
 *
 * @api {GET} /api/genres/:id/books?offset=10 Books by genre
 * @apiName GenresShowBooks
 * @apiGroup Genres
 * @apiVersion  1.0.0
 *
 *
 * @apiParam  {String} id Genre's database identifier
 * @apiParam  {Number} offset Number of results to skip
 *
 *
 */
router.get('/:id/books', genreController.showBooks);

/**
 *
 * @api {POST} /api/genres Create genre
 * @apiName GenresStore
 * @apiGroup Genres
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
router.post('/', isLoggedInMiddleware, isAdminMiddleware, genreController.store);

/**
 *
 * @api {PUT} /api/genres/:id Update genre
 * @apiName GenresUpdate
 * @apiGroup Genres
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
router.put('/:id', isLoggedInMiddleware, isAdminMiddleware, genreController.update);

/**
 *
 * @api {DELETE} /api/genres/:id Delete genre
 * @apiName GenresDestroy
 * @apiGroup Genres
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
router.delete('/:id', isLoggedInMiddleware, isAdminMiddleware, genreController.destroy);

module.exports = router;
