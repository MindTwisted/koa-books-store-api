const Cart = require('@models/cart');
const NotFoundError = require('@errors/NotFoundError');

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
                select: 'title description price discount image',
                populate: [{ path: 'authors', select: 'name' }, { path: 'genres', select: 'name' }],
            })
            .select('count book')
            .lean({ virtuals: true });

        ctx.render({ text: `${user.name}'s cart items.`, data: { user, cart } });
    },
    /**
     * Add book to cart
     *
     * @param {Context} ctx
     */
    async store(ctx) {
        const user = ctx.state.user;
        const { count, book } = ctx.request.body;
        const cart = await Cart.create({
            count,
            book,
            user: user._id,
        });
        const populatedCart = await cart
            .populate({
                path: 'book',
                select: 'title description price discount image',
                populate: [{ path: 'authors', select: 'name' }, { path: 'genres', select: 'name' }],
            })
            .execPopulate();

        ctx.render({ text: 'Book was successfully added to cart.', data: { user, cart: populatedCart } });
    },
    /**
     * Update current user's cart
     *
     * @param {Context} ctx
     */
    async update(ctx) {
        const id = ctx.params.id;
        const user = ctx.state.user;
        const { count } = ctx.request.body;
        const cart = await Cart.findOneAndUpdate(
            {
                _id: id,
                user: user._id,
            },
            {
                count,
            },
            { new: true, runValidators: true, context: 'query' },
        )
            .populate({
                path: 'book',
                populate: [{ path: 'authors', select: 'name' }, { path: 'genres', select: 'name' }],
            })
            .select('count book');

        if (!cart) {
            throw new NotFoundError('Not found.');
        }

        ctx.render({ text: 'Cart was successfully updated.', data: { user, cart } });
    },
    /**
     * Delete from current user's cart
     *
     * @param {Context} ctx
     */
    async destroy(ctx) {
        const id = ctx.params.id;
        const user = ctx.state.user;
        const cart = await Cart.findOneAndRemove({
            _id: id,
            user: user._id,
        })
            .populate({
                path: 'book',
            })
            .select('count book');

        if (!cart) {
            throw new NotFoundError('Not found.');
        }

        ctx.render({ text: `Book '${cart.book.title}' was successfully deleted from cart.` });
    },
};
