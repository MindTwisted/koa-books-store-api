const Order = require('@models/order');
const OrderService = require('@services/OrderService');

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
};
