'use strict';
var MongoClient = require('mongodb').MongoClient;

// Connection URL
const mongoURL = process.env.MONGODB_URI;
const databaseName = process.env.DATABASE_NAME;

exports.connect = () => {
    return new Promise((resolve, reject) => {

        MongoClient.connect(mongoURL, { useNewUrlParser: true })
            .then((connection) => {
                const db = connection.db(databaseName);
                const conObject =
                {
                    connection: connection,
                    db: db,
                    close: () => {
                        connection.close();
                        //db.close();
                    }
                };

                resolve(conObject);
            })
            .catch((err) => {
                reject(Error(err));
            });
    });
};