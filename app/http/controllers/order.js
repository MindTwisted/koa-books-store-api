const OrderService = require('@services/OrderService');

module.exports = {
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
