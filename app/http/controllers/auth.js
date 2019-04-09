const User = require('@models/user');

module.exports = {
    async register(ctx, next) {
        const { name, email, password } = ctx.request.body;

        try {
            const user = await User.create({ name, email, password });

            ctx.render({ text: 'User was successfully registered.', data: { user } });
        } catch (e) {
            ctx.error = e;

            return next();
        }
    },
};
