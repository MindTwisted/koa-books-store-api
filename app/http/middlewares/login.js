const User = require('@models/user');
const jwtService = require('@services/jwt');

module.exports = async (ctx, next) => {
    const { email, password } = ctx.request.body;

    if (!(email && password)) {
        return next();
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return next();
        }

        const isValidPassword = await user.isValidPassword(password);

        if (!isValidPassword) {
            return next();
        }

        const token = jwtService.sign({ user });

        ctx.state.user = user;
        ctx.state.token = token;

        return next();
    } catch (e) {
        ctx.state.error = e;

        return next();
    }
};
