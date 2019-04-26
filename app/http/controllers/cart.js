const Cart = require('@models/cart');
const NotFoundError = require('@errors/NotFoundError');

module.exports = {
    /**
     * Add book to cart
     *
     * @param {Context} ctx
     */
    async store(ctx) {
        const { count, book } = ctx.request.body;
        const cart = await Cart.create({
            count,
            book,
            user: ctx.state.user._id,
        });
        const populatedCart = await cart
            .populate({
                path: 'book',
                populate: [{ path: 'authors', select: 'name' }, { path: 'genres', select: 'name' }],
            })
            .populate('user')
            .execPopulate();

        ctx.render({ text: 'Book was successfully added to cart.', data: { cart: populatedCart } });
    },
};
