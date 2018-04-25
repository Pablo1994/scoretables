'use strict';
var express = require('express');
var router = express.Router();
const League = require('../models/leaguemodule');
const MatchDay = require('../models/matchdaymodule');
const TeamRow = require('../models/teamrowmodule');
var MongoClient = require('mongodb').MongoClient;
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

        findOneLeague(scoretablesdb, { "ID": req.params.id }, function (result) {
            dbConnection.close();
            res.send(result);
        });
    });
});

/* POST a League. */
router.post('/leagues', function (req, res) {
    console.log("router.post leagues");

    // Use connect method to connect to the database
        console.log("router.post leagues entro al if");
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

            // Validate it doesn't exist already.
            findOneLeague(scoretablesdb, { "ID": league.ID }, function (result) {
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
});

var genMatchDays = function (scoretablesdb, league) {
    console.log("genMatchDays, scoretablesdb: " + scoretablesdb);
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
    console.log("insertMatches, scoretablesdb: " + scoretablesdb);
    for (var i = 0; i < matches.length; i++) {
        insertOneMatch(scoretablesdb, matches[i]);
    };
}

var insertOneMatch = function (scoretablesdb, match) {
    console.log("insertOneMatch, scoretablesdb: " + scoretablesdb);
    // Get the matchdays collection.
    var collection = scoretablesdb.collection(matchday_collection);

    // Insert a document.
    collection.insertOne(match, function (err, result) {
        assert.equal(err, null);
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

router.get("/table/:id", function (req, res) {
    console.log('Received id: ' + req.params.id);

    var leagueID = req.params.id;
    var league;
    // Use connect method to connect to the database
    MongoClient.connect(mongoURL, function (err, dbConnection) {
        assert.equal(null, err);
        console.log("Connected correctly to database");
        const scoretablesdb = dbConnection.db(DATABASE_NAME);

        findOneLeague(scoretablesdb, { "ID": req.params.id }, function (result) {
            league = League.create(result.body.ID, result.body.Title, result.body.MatchDayAmount, result.body.Teams);
        });



        dbConnection.close();
    });
});

module.exports = router;