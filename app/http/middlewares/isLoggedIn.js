const UnauthorizedError = require('@errors/UnauthorizedError');

module.exports = async (ctx, next) => {
    if (!ctx.state.user) {
        throw new UnauthorizedError('Authentication required.');
    }

    return next();
};
