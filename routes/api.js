'use strict';
var express = require('express');
var router = express.Router();
const League = require('../models/leaguemodule');
const MatchDay = require('../models/matchdaymodule');
const TeamRow = require('../models/teamrowmodule');
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
    console.log("router.post leagues");

    // Use connect method to connect to the database
    MongoClient.connect(mongoURL, function (err, dbConnection) {
        assert.equal(null, err);
        console.log("Connected correctly to database");
        const scoretablesdb = dbConnection.db(DATABASE_NAME);
        
        console.log("Value of Body: " + JSON.stringify(req.body));
        assert.notEqual(req.body, null);
        console.log("Value of ID: " + req.body.ID);
        assert.notEqual(req.body.ID, null);
        console.log("Value of Title: " + req.body.Title);
        assert.notEqual(req.body.Title, null);
        console.log("Body, ID and Title are Fine!");
        // MatchDays greater than 0.
        console.log("Value of MatchDayAmount: " + req.body.MatchDayAmount);
        assert.notEqual(req.body.MatchDayAmount, null);
        assert.notEqual(req.body.MatchDayAmount, 0);
        console.log("MatchDayAmount is Fine!");
        // Teams not null and greater than 1 team.
        console.log("Value of Teams: " + JSON.stringify(req.body.Teams));
        assert.notEqual(req.body.Teams, null);
        assert.notEqual(req.body.Teams.length, 1);
        console.log("Teams are Fine!");

        var league = League.create(req.body.ID, req.body.Title, req.body.MatchDayAmount, req.body.Teams);
        const filter = { "ID": league.ID };

        // Validate it doesn't exist already.
        findOneLeague(scoretablesdb, filter, function (result) {
            console.log("Found: " + result);
            if (result == null || result.length == 0) {
                console.log("Good!! Now we insert the League");
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

/* DELETE to delete a League. */
router.delete('/leagues/:id', function (req, res) {

    console.log('Received id: ' + req.params.id);

    // Use connect method to connect to the database
    MongoClient.connect(mongoURL, function (err, dbConnection) {
        assert.equal(null, err);
        console.log("Connected correctly to database");
        const scoretablesdb = dbConnection.db(DATABASE_NAME);

        const filter = { "ID": req.params.id };
        const matchFilter = { "LeagueID": req.params.id };

        deleteOneLeague(scoretablesdb, filter, function (result) {
            console.log(result.n + " league document(s) deleted");
            deleteMatches(scoretablesdb, matchFilter, function (result) {
                console.log(result.n + " matchday document(s) deleted");
                dbConnection.close();
                res.send(result);
            });
        });
    });
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
router.put('/matchdays/:id', function (req, res) {

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

 /* DELETE to delete a MatchDay. */
router.delete('/matchdays/:id', function (req, res) {

    console.log('Received id: ' + req.params.id);

    // Use connect method to connect to the database
    MongoClient.connect(mongoURL, function (err, dbConnection) {
        assert.equal(null, err);
        console.log("Connected correctly to database");
        const scoretablesdb = dbConnection.db(DATABASE_NAME);

        const o_id = new mongo.ObjectID(req.params.id);
        const filter = { "_id": o_id };

        deleteOneMatch(scoretablesdb, filter, function (result) {
            dbConnection.close();
            console.log(result.n + " document(s) deleted");
            res.send(result);
        });
    });
});


/* DELETE to delete MatchDay by League ID. */
router.delete('/matchdaysleague/:leagueid', function (req, res) {

    console.log('Received leagueid: ' + req.params.leagueid);

    // Use connect method to connect to the database
    MongoClient.connect(mongoURL, function (err, dbConnection) {
        assert.equal(null, err);
        console.log("Connected correctly to database");
        const scoretablesdb = dbConnection.db(DATABASE_NAME);

        const filter = { "LeagueID": req.params.leagueid };

        deleteMatches(scoretablesdb, filter, function (result) {
            dbConnection.close();
            console.log(result.n + " document(s) deleted");
            res.send(result);
        });
    });
});

router.get("/scoretables/:id", function (req, res) {

    console.log('Received id: ' + req.params.id);

    // Use connect method to connect to the database
    MongoClient.connect(mongoURL, function (err, dbConnection) {
        assert.equal(null, err);
        console.log("Connected correctly to database");
        const scoretablesdb = dbConnection.db(DATABASE_NAME);

        var leagueID = req.params.id;

        findOneLeague(scoretablesdb, { "ID": leagueID }, function (result) {
            if (result != null) {
                var teams = result.Teams;

                findMatches(scoretablesdb, { "LeagueID": result.ID }, function (result) {
                    var matches = result;
                    var rows = assignStats(teams, matches);

                    var result = rows.sort(function (a, b) {
                        var aPoints = a.Points;
                        var bPoints = b.Points;
                        var aGoalDifference = a.GoalDifference;
                        var bGoalDifference = b.GoalDifference;
                        console.log(aGoalDifference + " | " + bGoalDifference);

                        if (bPoints == aPoints) {
                            return (aGoalDifference > bGoalDifference) ? -1 :
                                (aGoalDifference < bGoalDifference) ? 1 : 0;
                        }
                        else {
                            return (aPoints > bPoints) ? -1 : 1;
                        }
                    });

                    res.send(result);
                    dbConnection.close();
                });
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

var findOneMatch = function (scoretablesdb, filter, callback) {
    // Get the matchdays collection.
    var collection = scoretablesdb.collection(matchday_collection);

    // Find some documents.
    collection.findOne(filter, function (err, doc) {
        assert.equal(err, null);
        callback(doc);
    });
}

var findMatches = function (scoretablesdb, filter, callback) {
    // Get the matchdays collection.
    var collection = scoretablesdb.collection(matchday_collection);

    // Find some documents.
    collection.find(filter).toArray(function (err, docs) {
        assert.equal(err, null);
        callback(docs);
    });
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

var updateOneMatch = function (scoretablesdb, filter, updateValues, callback) {
    // Get the matchdays collection.
    var collection = scoretablesdb.collection(matchday_collection);

    // Update a document.
    collection.updateOne(filter, updateValues, function (err, result) {
        assert.equal(err, null);
        callback(result);
    });
}

var deleteOneMatch = function (scoretablesdb, filter, callback) {
    // Get the matchdays collection.
    var collection = scoretablesdb.collection(matchday_collection);

    // Delete one document.
    collection.deleteOne(filter, function (err, obj) {
        assert.equal(err, null);
        console.log(obj.result.n + " document(s) deleted");
        callback(obj.result);
    });
}

var deleteMatches = function (scoretablesdb, filter, callback) {
    // Get the matchdays collection.
    var collection = scoretablesdb.collection(matchday_collection);

    // Delete some documents.
    collection.deleteMany(filter, function (err, obj) {
        assert.equal(err, null);
        console.log(obj.result.n + " document(s) deleted");
        callback(obj.result);
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


var assignStats = function (teams, matches) {
    var teamRows = teams.map(function (team) { return TeamRow.create(team.ID, team.Team) });
    // In case shit gets slow
    //var filteredMatches = matches.filter(match => match.HomeScore != null);
    //for (var i = 0; i < filteredMatches.length; i++) {
    //    var team1index = teamRows.findIndex(function (team) { return team.ID === match.HomeTeam.ID });
    //    var team2index = teamRows.findIndex(function (team) { return team.ID === match.AwayTeam.ID });
    //    teamRows[team1index].PlayedMatches++;
    //    teamRows[team2index].PlayedMatches++;

    //    teamRows[team1index].GoalsInFavor += match.HomeScore;
    //    teamRows[team2index].GoalsInFavor += match.AwayScore;

    //    teamRows[team1index].GoalsAgainst -= match.AwayScore;
    //    teamRows[team2index].GoalsAgainst -= match.HomeScore;

    //    var homeDiff = match.HomeScore - match.AwayScore;

    //    teamRows[team1index].GoalDifference += homeDiff;
    //    teamRows[team2index].GoalDifference -= homeDiff;

    //    switch (Math.sign(homeDiff)) {
    //        case 1:
    //            teamRows[team1index].Wins++;
    //            teamRows[team1index].Points += 3;
    //            teamRows[team2index].Losses++;
    //        case 0:
    //            teamRows[team1index].Draws++;
    //            teamRows[team1index].Points++;
    //            teamRows[team2index].Draws++;
    //            teamRows[team2index].Points++;
    //        case -1:
    //            teamRows[team2index].Wins++;
    //            teamRows[team2index].Points += 3;
    //            teamRows[team1index].Losses++;
    //    }
    //}
    matches.filter(match => match.HomeScore != null).forEach(function (match) {
        var team1index = teamRows.findIndex(function (team) { return team.ID === match.HomeTeam.ID });
        var team2index = teamRows.findIndex(function (team) { return team.ID === match.AwayTeam.ID });
        teamRows[team1index].PlayedMatches++;
        teamRows[team2index].PlayedMatches++;

        teamRows[team1index].GoalsInFavor += match.HomeScore;
        teamRows[team2index].GoalsInFavor += match.AwayScore;

        teamRows[team1index].GoalsAgainst += match.AwayScore;
        teamRows[team2index].GoalsAgainst += match.HomeScore;

        var homeDiff = match.HomeScore - match.AwayScore;

        teamRows[team1index].GoalDifference += homeDiff;
        teamRows[team2index].GoalDifference -= homeDiff;

        switch (Math.sign(homeDiff)) {
            case 1:
                teamRows[team1index].Wins++;
                teamRows[team1index].Points += 3;
                teamRows[team2index].Losses++;
                break;
            case 0:
                teamRows[team1index].Draws++;
                teamRows[team1index].Points++;
                teamRows[team2index].Draws++;
                teamRows[team2index].Points++;
                break;
            case -1:
                teamRows[team2index].Wins++;
                teamRows[team2index].Points += 3;
                teamRows[team1index].Losses++;
                break;
        }
    });
    return teamRows;
}

var deleteOneLeague = function (scoretablesdb, filter, callback) {
    // Get the leagues collection.
    var collection = scoretablesdb.collection(league_collection);

    // Delete one document.
    collection.deleteOne(filter, function (err, obj) {
        assert.equal(err, null);
        console.log(obj.result.n + " document(s) deleted");
        callback(obj.result);
    });
}

var deleteLeagues = function (scoretablesdb, filter, callback) {
    // Get the leagues collection.
    var collection = scoretablesdb.collection(league_collection);

    // Delete some documents.
    collection.deleteMany(filter, function (err, obj) {
        assert.equal(err, null);
        console.log(obj.result.n + " document(s) deleted");
        callback(obj.result);
    });
}

module.exports = router;