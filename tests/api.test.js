'use strict';

describe('Api Module tests', async () => {
    const apiMod = require('../modules/apimod');
    const { MongoClient } = require('mongodb');

    let connection;
    // let db;

    beforeEach(async () => {
        connection = await MongoClient.connect(global.__MONGO_URI__, { useNewUrlParser: true });
        //db = await connection.db(global.__MONGO_DB_NAME__);
        console.log('Connected to DB');
    });

    afterEach(async () => {
        await connection.close();
        // await db.close();
        console.log('Closed DB connection');
    });
    
    test('basicTest', () => {
        apiMod.basicTest();

        expect(true);
    });

    test('basicTestDB', () => {
        const message = apiMod.basicTestDB(connection);
        expect(message).toBeDefined();
    });
});