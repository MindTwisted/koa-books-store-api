module.exports = (ctx, next) => {
    ctx.render = function(data, code = 200) {
        this.status = code;
        this.body = {
            status: code === 200 ? 'success' : 'failed',
            ...data,
        };
    };

    return next();
};
