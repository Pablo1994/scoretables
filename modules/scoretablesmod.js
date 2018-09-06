'use strict';
const TeamRow = require('../models/teamrowmodule');
const matchdayMod = require('./matchdaymod');
const leagueMod = require('./leaguesmod');

//#region DB queries

//#endregion DB queries

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

exports.getByLeague = async (conObjects, id) => {
    const league = await leagueMod.getById(conObjects, id);

    if (league) {
        const teams = league.Teams;
    
        const matches = await matchdayMod.getByLeague(conObjects, league.ID);
    
        let rows = assignStats(teams, matches);
    
        const data = rows.sort((a, b) => {
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

        return data;
    }

    return null;
};



