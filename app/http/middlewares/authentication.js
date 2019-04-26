const jwtService = require('@services/jwt');
const User = require('@models/user');

module.exports = async (ctx, next) => {
    const authorizationHeader = ctx.request.header.authorization;

    if (!authorizationHeader) {
        return next();
    }

    const token = authorizationHeader.slice(7);

    if (!token) {
        return next();
    }

    const payload = jwtService.verify(token);

    if (!payload) {
        return next();
    }

    const userId = payload.user.id;

    if (!userId) {
        return next();
    }

    const user = await User.findById(userId)
        .lean()
        .select('name email role discount');

    if (!user) {
        return next();
    }

    ctx.state.user = user;

    return next();
};
