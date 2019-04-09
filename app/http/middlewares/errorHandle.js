const validationErrorSerializer = require('@serializers/validationError');

module.exports = (ctx, next) => {
    const error = ctx.error;

    switch (error.name) {
        case 'ValidationError':
            ctx.render(
                {
                    text: 'Validation failed',
                    data: {
                        errors: validationErrorSerializer.serialize(error.errors),
                    },
                },
                422,
            );

            return next();
        default:
            ctx.render(
                {
                    text: 'Unexpected error occurred.',
                },
                500,
            );

            return next();
    }
};
