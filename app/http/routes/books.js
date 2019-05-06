const Router = require('koa-router');
const router = new Router({ prefix: '/books' });
const bookController = require('@controllers/book');
const isLoggedInMiddleware = require('@middlewares/isLoggedIn');
const isAdminMiddleware = require('@middlewares/isAdmin');

/**
 *
 * @api {GET} /api/books?offset=10&search=abc&authors=5ccb137f3e4d3a2290eca7fb&genres=5cc190db1b538c13d8d80abf,5cc190db1b538c13d8d80ac9 All books
 * @apiName BooksIndex
 * @apiGroup Books
 * @apiVersion  1.0.0
 *
 *
 * @apiParam  {Number} offset Number of results to skip
 * @apiParam  {String} search Text to search with
 * @apiParam  {String} authors List of author ids
 * @apiParam  {String} genres List of genre ids
 *
 *
 */
router.get('/', bookController.index);

/**
 *
 * @api {GET} /api/books/:id Single book
 * @apiName BooksShow
 * @apiGroup Books
 * @apiVersion  1.0.0
 *
 *
 * @apiParam  {String} id Book's database identifier
 *
 *
 */
router.get('/:id', bookController.show);

/**
 *
 * @api {POST} /api/books Create book
 * @apiName BooksStore
 * @apiGroup Books
 * @apiVersion  1.0.0
 * @apiPermission IsAdmin
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 * @apiParam  {String{6..}} title New title
 * @apiParam  {String{20..}} description New description
 * @apiParam  {Number{0-infinity}} price New price
 * @apiParam  {Number{0-50}} discount New discount
 * @apiParam  {String} [authors] List of author ids related to book
 * @apiParam  {String} [genres] List of genre ids related to book
 *
 *
 */
router.post('/', isLoggedInMiddleware, isAdminMiddleware, bookController.store);

/**
 *
 * @api {POST} /api/books/:id/image Store image for book
 * @apiName BooksStoreImage
 * @apiGroup Books
 * @apiVersion  1.0.0
 * @apiPermission IsAdmin
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 * @apiParam  {String} id Book's database identifier
 * @apiParam  {File} image Image file for book
 *
 *
 */
router.post('/:id/image', isLoggedInMiddleware, isAdminMiddleware, bookController.storeImage);

/**
 *
 * @api {POST} /api/books/:id Update book
 * @apiName BooksUpdate
 * @apiGroup Books
 * @apiVersion  1.0.0
 * @apiPermission IsAdmin
 *
 *
 * @apiHeader {String} Authorization User's JWT access token
 * @apiHeaderExample Header-Example:
 * Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWNjYjEzN2QzZTRkM2EyMjkwZWNhNjQxIn0sImlhdCI6MTU1NjkwMTE5NCwiZXhwIjoxNTU2OTA0Nzk0fQ.M3ApiK_5gxPlztwoLMwLAqizP1s3gsoTj31n-gaeZyOc_-S4xt0AxJDrAChJd1CrVMWmj1517sFL9S2y351kxg
 *
 *
 * @apiParam  {String{6..}} title Updated title
 * @apiParam  {String{20..}} description Updated description
 * @apiParam  {Number{0-infinity}} price Updated price
 * @apiParam  {Number{0-50}} discount Updated discount
 * @apiParam  {String} [authors] List of author ids related to book
 * @apiParam  {String} [genres] List of genre ids related to book
 *
 *
 */
router.put('/:id', isLoggedInMiddleware, isAdminMiddleware, bookController.update);

/**
 *
 * @api {DELETE} /api/books/:id Delete book
 * @apiName BooksDestroy
 * @apiGroup Books
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
router.delete('/:id', isLoggedInMiddleware, isAdminMiddleware, bookController.destroy);

module.exports = router;
