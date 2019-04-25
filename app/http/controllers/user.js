const User = require('@models/user');
const NotFoundError = require('@errors/NotFoundError');

module.exports = {
    /**
     * Get all users
     *
     * @param {Context} ctx
     */
    async index(ctx) {
        const { offset, name, email } = ctx.request.query;
        const nameClause = name ? { name: new RegExp(name, 'i') } : {};
        const emailClause = email ? { email: new RegExp(email, 'i') } : {};
        const offsetClause = offset ? { skip: Number(offset) } : {};
        const users = await User.find({ ...nameClause, ...emailClause }, {}, { limit: 50, ...offsetClause })
            .lean()
            .select('name email role discount');

        ctx.render({ data: { users } });
    },
    /**
     * Get user by id
     *
     * @param {Context} ctx
     */
    async show(ctx) {
        const id = ctx.params.id;
        const user = await User.findById(id)
            .lean()
            .select('name email role discount');

        if (!user) {
            throw new NotFoundError('Not found.');
        }

        ctx.render({ data: { user } });
    },

    // TODO: add showOrders
};
