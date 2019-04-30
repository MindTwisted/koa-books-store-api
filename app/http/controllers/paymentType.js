const PaymentType = require('@models/paymentType');

module.exports = {
    /**
     * Get all paymentTypes
     *
     * @param {Context} ctx
     */
    async index(ctx) {
        const paymentTypes = await PaymentType.find({})
            .lean()
            .select('name');

        ctx.render({ data: { paymentTypes } });
    },
};
