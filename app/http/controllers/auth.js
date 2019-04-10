const User = require('@models/user');

module.exports = {
    async register(ctx) {
        const { name, email, password } = ctx.request.body;
        const user = await User.create({ name, email, password });

        return ctx.render({ text: `User '${user.name}' was successfully registered.`, data: { user } });
    },
    async login(ctx) {
        const user = ctx.state.user;
        const token = ctx.state.token;

        return ctx.render({ text: `User '${user.name}' was successfully logged in.`, data: { user, token } });
    },
    async current(ctx) {
        const user = ctx.state.user;

        return ctx.render({ data: { user } });
    },
};
