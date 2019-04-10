const jwtService = require('@services/jwt');

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

    ctx.state.user = payload.user;

    return next();
};
