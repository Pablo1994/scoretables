'use strict';
var express = require('express');
var router = express.Router();
const League = require('../models/leaguemodule');
const MatchDay = require('../models/matchdaymodule');
const mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var assert = require('assert');
const league_collection = 'leagues';
const matchday_collection = 'matchdays';
const DATABASE_NAME = process.env.DATABASE_NAME;

const db = [];
var debug = process.env.DEBUG_FLAG;

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

        const filter = {};

        findLeagues(scoretablesdb, filter, function (result) {
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

        const filter = { "ID": req.params.id };

        findOneLeague(scoretablesdb, filter, function (result) {
            dbConnection.close();
            res.send(result);
        });
    });
});

/* POST a League. */
router.post('/leagues', function (req, res) {

    // Use connect method to connect to the database
    if (!debug) {
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

            var league = League.create(req.body.ID, req.body.Title, req.body.MatchDayAmount, req.body.Teams);
            const filter = { "ID": league.ID };

            // Validate it doesn't exist already.
            findOneLeague(scoretablesdb, filter, function (result) {
                if (result == null || result.length == 0) {
                    insertOneLeague(scoretablesdb, league, function (result) {
                        genMatchDays(scoretablesdb, league);
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
    } else {
        var league = League.create(req.body.ID, req.body.Title, req.body.MatchDayAmount, req.body.Teams);
        genMatchDays(scoretablesdb, league)
    }
});

/* GET all MatchDays. */
router.get('/matchdays', function (req, res) {

    // Use connect method to connect to the database
    MongoClient.connect(mongoURL, function (err, dbConnection) {
        assert.equal(null, err);
        console.log("Connected correctly to database");
        const scoretablesdb = dbConnection.db(DATABASE_NAME);

        const filter = {};

        findMatches(scoretablesdb, filter, function (result) {
            dbConnection.close();
            res.send(result);
        });
    });
});

/* GET a League. */
router.get('/matchday/:id', function (req, res) {

    console.log('Received id: ' + req.params.id);

    // Use connect method to connect to the database
    MongoClient.connect(mongoURL, function (err, dbConnection) {
        assert.equal(null, err);
        console.log("Connected correctly to database");
        const scoretablesdb = dbConnection.db(DATABASE_NAME);

        const o_id = new mongo.ObjectID(req.params.id);
        const filter = { "_id": o_id };

        findOneMatch(scoretablesdb, filter, function (result) {
            dbConnection.close();
            res.send(result);
        });
    });
});

/* GET all MatchDays of a League. */
router.get('/matchdays/:leagueid', function (req, res) {

    console.log('Received leagueid: ' + req.params.leagueid);

    // Use connect method to connect to the database
    MongoClient.connect(mongoURL, function (err, dbConnection) {
        assert.equal(null, err);
        console.log("Connected correctly to database");
        const scoretablesdb = dbConnection.db(DATABASE_NAME);

        const filter = { "LeagueID": req.params.leagueid };

        findMatches(scoretablesdb, filter, function (result) {
            dbConnection.close();
            res.send(result);
        });
    });
});

/* GET all MatchDays for a specific MatchDay count of a League. */
router.get('/matchdays/:leagueid/:count', function (req, res) {

    console.log('Received leagueid: ' + req.params.leagueid);

    console.log('Received count: ' + req.params.count);

    // Use connect method to connect to the database
    MongoClient.connect(mongoURL, function (err, dbConnection) {
        assert.equal(null, err);
        console.log("Connected correctly to database");
        const scoretablesdb = dbConnection.db(DATABASE_NAME);

        const filter = { "LeagueID": req.params.leagueid, "MatchDay": parseInt(req.params.count) };

        findMatches(scoretablesdb, filter, function (result) {
            dbConnection.close();
            res.send(result);
        });
    });
});

/* PUT to update a MatchDay. */
router.put('/matchday/:id', function (req, res) {

    console.log('Received id: ' + req.params.id);

    // Use connect method to connect to the database
    MongoClient.connect(mongoURL, function (err, dbConnection) {
        assert.equal(null, err);
        console.log("Connected correctly to database");
        const scoretablesdb = dbConnection.db(DATABASE_NAME);

        const o_id = new mongo.ObjectID(req.params.id);
        const filter = { "_id": o_id };
        const newvalues = { $set: { HomeScore: req.body.HomeScore, AwayScore: req.body.AwayScore, UpdateDate: new Date() } };

        updateOneMatch(scoretablesdb, filter, newvalues, function (result) {
            dbConnection.close();
            console.log(result.nModified + " document(s) updated");
            res.send(result);
        });
    });
});

var genMatchDays = function (scoretablesdb, league) {
    var leagueID = league.ID;
    var MDAmount = league.MatchDayAmount;
    var teams = league.Teams;
    var result;

    for (var i = 1; i <= MDAmount; i++) {
        var pairs = pairTeams(teams, leagueID, i);
        if (result == null) result = pairs; else result.concat(pairs);
        insertMatches(scoretablesdb, pairs);
    }
}

var pairTeams = function(teams, id, matchDay) {
    if (teams.length < 2) { return []; }
    var homeTeam, awayTeams, matches;
    homeTeam = teams[0], awayTeams = teams.slice(1);
    if (matchDay % 2 == 0)
        matches = awayTeams.map(function (awayTeam) { return MatchDay.create(id, matchDay, homeTeam, awayTeam, null, null) });
    else
        matches = awayTeams.map(function (awayTeam) { return MatchDay.create(id, matchDay, awayTeam, homeTeam, null, null) });
    return matches.concat(pairTeams(awayTeams, id, matchDay));
}

var insertMatches = function (scoretablesdb, matches) {
    for (var i = 0; i < matches.length; i++) {
        insertOneMatch(scoretablesdb, matches[i]);
    };
}

var findOneMatch = function (scoretablesdb, filter, callback) {
    // Get the leagues collection.
    var collection = scoretablesdb.collection(matchday_collection);

    // Find some documents.
    collection.findOne(filter, function (err, doc) {
        assert.equal(err, null);
        callback(doc);
    });
}

var findMatches = function (scoretablesdb, filter, callback) {
    // Get the leagues collection.
    var collection = scoretablesdb.collection(matchday_collection);

    // Find some documents.
    collection.find(filter).toArray(function (err, docs) {
        assert.equal(err, null);
        callback(docs);
    });
}

var insertOneMatch = function (scoretablesdb, match) {
    // Get the matchdays collection.
    var collection = scoretablesdb.collection(matchday_collection);

    // Insert a document.
    collection.insertOne(match, function (err, result) {
        assert.equal(err, null);
        callback(result);
    });
}

var updateOneMatch = function (scoretablesdb, filter, updateValues, callback) {
    // Get the matchdays collection.
    var collection = scoretablesdb.collection(matchday_collection);

    // Update a document.
    collection.updateOne(filter, updateValues, function (err, result) {
        assert.equal(err, null);
        callback(result);
    });
}

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