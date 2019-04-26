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
    /**
     * Update user by id
     *
     * @param {Context} ctx
     */
    async update(ctx) {
        const id = ctx.params.id;
        const { name, email, discount } = ctx.request.body;
        const user = await User.findOneAndUpdate(
            { _id: id },
            { name, email, discount },
            { new: true, runValidators: true, context: 'query' },
        );

        if (!user) {
            throw new NotFoundError('Not found.');
        }

        ctx.render({ text: `User '${user.name}' was successfully updated.`, data: { user } });
    },
    /**
     * Update current user
     *
     * @param {Context} ctx
     */
    async updateCurrent(ctx) {
        const id = ctx.state.user._id;
        const { name, email, password } = ctx.request.body;
        const user = await User.findById(id);

        user.name = name;
        user.email = email;
        user.password = password;

        await user.save();

        ctx.render({ text: `User '${user.name}' was successfully updated.`, data: { user } });
    },

    // TODO: add showOrders
};
