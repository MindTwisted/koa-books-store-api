const User = require('@models/user');

module.exports = {
    /**
     * Register new user
     *
     * @param {Context} ctx
     */
    async register(ctx) {
        const { name, email, password } = ctx.request.body;
        const user = await User.create({ name, email, password });

        ctx.render({ text: `User '${user.name}' was successfully registered.`, data: { user } });
    },
    /**
     * Login user
     *
     * @param {Context} ctx
     */
    async login(ctx) {
        const user = ctx.state.user;
        const token = ctx.state.token;

        ctx.render({ text: `User '${user.name}' was successfully logged in.`, data: { user, token } });
    },
    /**
     * Get authenticated user info
     *
     * @param {Context} ctx
     */
    async current(ctx) {
        const user = ctx.state.user;

        ctx.render({ data: { user } });
    },
};
