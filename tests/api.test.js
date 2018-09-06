'use strict';

describe('Api Module tests', () => {
    const { MongoClient } = require('mongodb');

    let connection;
    let db;

    beforeEach(async () => {
        connection = await MongoClient.connect(global.__MONGO_URI__, { useNewUrlParser: true });
        db = await connection.db(global.__MONGO_DB_NAME__);
    });

    afterAll(async () => {
        await connection.close();
        await db.close();
    });
    
    test('basicTest', () => {
        apiMod.basicTest();

        expect();
    });

    test('basicTestDB', () => {
        const message = apiMod.basicTestDB(connection);
        expect(message).toBeDefined();
    });
});