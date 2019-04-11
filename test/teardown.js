module.exports = async () => {
    const connection = await global.connection;

    await connection.connections[0].db.dropDatabase();
};
