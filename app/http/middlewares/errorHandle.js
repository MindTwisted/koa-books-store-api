const validationErrorSerializer = require('@serializers/validationError');
const castErrorSerializer = require('@serializers/castError');

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
            case 'CastError':
                return ctx.render(
                    {
                        text: 'Validation failed',
                        data: {
                            errors: castErrorSerializer.serialize(error),
                        },
                    },
                    422,
                );
            case 'UploadError':
                return ctx.render(
                    {
                        text: error.message,
                        data: {
                            errors: {
                                [error.fieldName]: error.errors,
                            },
                        },
                    },
                    422,
                );
            case 'UnauthorizedError':
                return ctx.render({ text: error.message }, 401);
            case 'LoginError':
            case 'ForbiddenError':
                return ctx.render({ text: error.message }, 403);
            case 'NotFoundError':
                return ctx.render({ text: error.message }, 404);
            default:
                return ctx.render({ text: 'Unexpected error occurred.' }, 500);
        }
    }
};
