const ForbiddenError = require('@errors/ForbiddenError');

module.exports = async (ctx, next) => {
    if (ctx.state.user.role !== 'admin') {
        throw new ForbiddenError('Access forbidden.');
    }

    return next();
};
