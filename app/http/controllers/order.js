const Order = require('@models/order');
const OrderService = require('@services/OrderService');
const NotFoundError = require('@errors/NotFoundError');

module.exports = {
    /**
     * Get all orders
     *
     * @param {Context} ctx
     */
    async index(ctx) {
        const { offset, user } = ctx.request.query;
        const userClause = user ? { user } : {};
        const offsetClause = offset ? { skip: Number(offset) } : {};
        const orders = await Order.find({ ...userClause }, {}, { limit: 50, ...offsetClause })
            .populate('paymentType', 'name')
            .select('status totalDiscount totalPrice details')
            .lean();

        ctx.render({ data: { orders } });
    },
    /**
     * Get all orders of current user
     *
     * @param {Context} ctx
     */
    async indexCurrent(ctx) {
        const user = ctx.state.user;
        const { offset } = ctx.request.query;
        const offsetClause = offset ? { skip: Number(offset) } : {};
        const orders = await Order.find({ user: user._id }, {}, { limit: 50, ...offsetClause })
            .populate('paymentType', 'name')
            .select('status totalDiscount totalPrice details')
            .lean();

        ctx.render({ data: { orders } });
    },
    /**
     * Create new order
     *
     * @param {Context} ctx
     */
    async store(ctx) {
        const user = ctx.state.user;
        const { paymentType } = ctx.request.body;
        const orderService = new OrderService(user, paymentType);
        const order = await orderService.save();

        ctx.render({ text: 'Order was successfully created.', data: { order } });
    },
    /**
     * Update order
     *
     * @param {Context} ctx
     */
    async update(ctx) {
        const id = ctx.params.id;
        const { status } = ctx.request.body;
        const order = await Order.findOneAndUpdate(
            { _id: id },
            { status },
            { new: true, runValidators: true, context: 'query' },
        )
            .populate('paymentType', 'name')
            .select('status totalDiscount totalPrice details');

        if (!order) {
            throw new NotFoundError('Not found.');
        }

        ctx.render({ text: 'Order was successfully updated.', data: { order } });
    },
    /**
     * Delete order
     *
     * @param {Context} ctx
     */
    async destroy(ctx) {
        const id = ctx.params.id;
        const order = await Order.findOneAndRemove({ _id: id });

        if (!order) {
            throw new NotFoundError('Not found.');
        }

        ctx.render({ text: 'Order was successfully deleted.' });
    },
};
