const User = require('@models/user');
const jwtService = require('@services/jwt');
const LoginError = require('@errors/LoginError');

module.exports = async (ctx, next) => {
    const { email, password } = ctx.request.body;

    if (!(email && password)) {
        throw new LoginError('Invalid credentials.');
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new LoginError('Invalid credentials.');
    }

    const isValidPassword = await user.isValidPassword(password);

    if (!isValidPassword) {
        throw new LoginError('Invalid credentials.');
    }

    const token = jwtService.sign({ user });

    ctx.state.user = user;
    ctx.state.token = token;

    return next();
};
