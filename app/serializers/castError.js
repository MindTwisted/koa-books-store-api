module.exports = {
    serialize(error) {
        return {
            [error.path]: `Invalid value ${error.stringValue}.`,
        };
    },
};
