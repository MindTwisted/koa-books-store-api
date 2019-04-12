module.exports = async () => {
    await global.connection.connections[0].db.dropDatabase();
};
