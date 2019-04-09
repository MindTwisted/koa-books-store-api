module.exports = {
    serialize(errors) {
        const result = {};

        Object.keys(errors).map(key => {
            result[key] = errors[key].message;
        });

        return result;
    },
};
