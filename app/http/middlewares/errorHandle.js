const validationErrorSerializer = require('@serializers/validationError');

module.exports = async (ctx, next) => {
    try {
        await next();
    } catch (error) {
        switch (error.name) {
            case 'ValidationError':
                return ctx.render(
                    {
                        text: 'Validation failed',
                        data: {
                            errors: validationErrorSerializer.serialize(error.errors),
                        },
                    },
                    422,
                );
            case 'UnauthorizedError':
                return ctx.render({ text: error.message }, 401);
            case 'LoginError':
                return ctx.render({ text: error.message }, 403);
            default:
                return ctx.render(
                    {
                        text: 'Unexpected error occurred.',
                    },
                    500,
                );
        }
    }
};
