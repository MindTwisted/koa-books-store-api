const generateUniqueValues = (count, generator) => {
    const unique = {};

    while (Object.keys(unique).length < count) {
        const value = generator();

        unique[value] = true;
    }

    return Object.keys(unique);
};

const arrayFromList = list => {
    if (Array.isArray(list)) {
        return list;
    }

    return list.split(',').map(item => item.trim());
};

module.exports = {
    generateUniqueValues,
    arrayFromList,
};
