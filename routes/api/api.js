'use strict';
var express = require('express');
var router = express.Router();
const TeamRow = require('../../models/teamrowmodule');
const mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var assert = require('assert');
const DATABASE_NAME = process.env.DATABASE_NAME;

// Connection URL
var mongoURL = process.env.MONGODB_URI;

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

var assignStats = function (teams, matches) {
    var teamRows = teams.map(function (team) { return TeamRow.create(team.ID, team.Team) });
    // In case it gets slow
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

const apiMod = require('../../modules/apimod');
const mongoMod = require('../../modules/mongomod');

// Helper method to get a good connection to DB or gracefully failover.
async function getConnectionObjects(res) {
    try { return await mongoMod.connect(); }
    catch (error) {
        console.log(error);
        bad(res, 'Error establishing connection');
    }
}

// Send simple OK response.
function ok(res, message) {
    res.statusCode = 200;
    res.send(message);
}

// Send simple BAD response.
function bad(res, message) {
    res.statusCode = 400;
    res.send(message);
}

/* GET simple service online test. */
router.get('/test', function (req, res) {
    ok(res, apiMod.basicTest());
});

/* GET simple database connectivity test. */
router.get('/testdb', async function (req, res) {
    const conObjects = await getConnectionObjects(res);

    ok(res, apiMod.basicTestDB(conObjects.connection));

    conObjects.close();
    return true;
});

module.exports = router;