const User = require('@models/user');

module.exports = {
    async register(ctx, next) {
        const { name, email, password } = ctx.request.body;

        try {
            const user = await User.create({ name, email, password });

            return ctx.render({ text: 'User was successfully registered.', data: { user } });
        } catch (e) {
            ctx.state.error = e;

            return next();
        }
    },
    async login(ctx) {
        const user = ctx.state.user;
        const token = ctx.state.token;

        if (!(user && token)) {
            return ctx.render({ text: 'Invalid credentials.' }, 403);
        }

        return ctx.render({ text: `User '${user.name}' was successfully logged in.`, data: { user, token } });
    },
};
