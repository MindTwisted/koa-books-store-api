const User = require('@models/user');

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
};
