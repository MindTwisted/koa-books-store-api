const generateUniqueValues = (count, generator) => {
    const unique = {};

    while (Object.keys(unique).length < count) {
        const value = generator();

        unique[value] = true;
    }

    return Object.keys(unique);
};

module.exports = {
    generateUniqueValues,
};
