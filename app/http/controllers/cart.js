const Cart = require('@models/cart');

module.exports = {
    /**
     * Get cart of current user
     *
     * @param {Context} ctx
     */
    async index(ctx) {
        const user = ctx.state.user;
        const cart = await Cart.find({ user: user._id })
            .populate({
                path: 'book',
                populate: [{ path: 'authors', select: 'name' }, { path: 'genres', select: 'name' }],
            })
            .select('-user')
            .lean();

        ctx.render({ text: `${user.name}'s cart items.`, data: { user, cart } });
    },
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
