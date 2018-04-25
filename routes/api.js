'use strict';
var express = require('express');
var router = express.Router();
const League = require('../models/leaguemodule');
const MatchDay = require('../models/matchdaymodule');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
const league_collection = 'leagues';
const matchday_collection = 'matchdays';
const DATABASE_NAME = process.env.DATABASE_NAME;

// Connection URL
var mongoURL = process.env.MONGODB_URI;

/* GET generic test. */
router.get('/hello', function (req, res) {

    res.send({ "message": "Hello World" });
});

/* GET all Leagues. */
router.get('/leagues', function (req, res) {

    // Use connect method to connect to the database
    MongoClient.connect(mongoURL, function (err, dbConnection) {
        assert.equal(null, err);
        console.log("Connected correctly to database");
        const scoretablesdb = dbConnection.db(DATABASE_NAME);

        findLeagues(scoretablesdb, {}, function (result) {
            dbConnection.close();
            res.send(result);
        });
    });
});

/* GET a League. */
router.get('/leagues/:id', function (req, res) {

    console.log('Received id: ' + req.params.id);

    // Use connect method to connect to the database
    MongoClient.connect(mongoURL, function (err, dbConnection) {
        assert.equal(null, err);
        console.log("Connected correctly to database");
        const scoretablesdb = dbConnection.db(DATABASE_NAME);

        findOneLeague(scoretablesdb, { "ID": parseInt(req.params.id) }, function (result) {
            dbConnection.close();
            res.send(result);
        });
    });
});

/* POST a League. */
router.post('/leagues', function (req, res) {

    // Use connect method to connect to the database
    MongoClient.connect(mongoURL, function (err, dbConnection) {
        assert.equal(null, err);
        console.log("Connected correctly to database");
        const scoretablesdb = dbConnection.db(DATABASE_NAME);

        assert.notEqual(req.body, null);
        assert.notEqual(req.body.ID, null);
        assert.notEqual(req.body.Title, null);
        // MatchDays greater than 0.
        assert.notEqual(req.body.MatchDayAmount, null);
        assert.notEqual(req.body.MatchDayAmount, 0);
        // Teams not null and greater than 1 team.
        assert.notEqual(req.body.Teams, null);
        assert.notEqual(req.body.Teams.length, 1);

        // Validate it doesn't exist already.
        findOneLeague(scoretablesdb, { "ID": req.body.ID }, function (result) {
            if (result === null || result.length == 0) {
                insertOneLeague(scoretablesdb, req.body, function (result) {
                    dbConnection.close();
                    res.statusCode = 201;
                    res.send(result);
                });
            }
            else {
                dbConnection.close();
                res.statusCode = 409;
                res.send("League already exists");
            }
        });
    });
});

var findOneLeague = function (scoretablesdb, filter, callback) {
    // Get the leagues collection.
    var collection = scoretablesdb.collection(league_collection);

    // Find some documents.
    collection.findOne(filter, function (err, doc) {
        assert.equal(err, null);
        callback(doc);
    });
}

var findLeagues = function (scoretablesdb, filter, callback) {
    // Get the leagues collection.
    var collection = scoretablesdb.collection(league_collection);

    // Find some documents.
    collection.find(filter).toArray(function (err, docs) {
        assert.equal(err, null);
        callback(docs);
    });
}

var insertOneLeague = function (scoretablesdb, document, callback) {
    // Get the leagues collection.
    var collection = scoretablesdb.collection(league_collection);

    // Insert a document.
    collection.insertOne(document, function (err, result) {
        assert.equal(err, null);
        callback(result);
    });
}

module.exports = router;