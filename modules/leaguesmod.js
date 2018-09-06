'use strict';
//const assert = require('assert');
const matchdayMod = require('./matchdaymod');
const MatchDay = require('../models/matchdaymodule');
const League = require('../models/leaguemodule');

const league_collection = 'leagues';

//#region DB queries

const findOneLeague = async function (collection, filter) {
    let result;

    try { 
        result = await collection.findOne(filter);
    }
    catch (error) {
        console.log(error);
    }

    return result;
}

const findLeagues = async function (collection, filter) {
    let result;

    try { 
        result = await collection.find(filter).toArray();
    }
    catch (error) {
        console.log(error);
    }

    return result;
}

const insertOneLeague = async function (collection, document) {
    let result;

    try { 
        result = await collection.insertOne(document);
    }
    catch (error) {
        console.log(error);
    }

    return result;
}

const deleteOneLeague = async function (collection, filter) {
    let result;

    try { 
        const obj = await collection.deleteOne(filter);
        result = obj.result;
        console.log(result.n + " document(s) deleted");
    }
    catch (error) {
        console.log(error);
    }

    return result;
}

const deleteLeagues = async function (collection, filter) {
    let result;

    try { 
        const obj = await collection.deleteMany(filter);
        result = obj.result;
        console.log(result.n + " document(s) deleted");
    }
    catch (error) {
        console.log(error);
    }

    return result;
}

/**
 * Single method to get leagues collection.
 * @param {*} conObjects Connection Objects
 */
const getCol = function (conObjects) {
    return conObjects.db.collection(league_collection);
}

//#endregion DB queries

//#region Validation functions

function validateCreateInput(reqData) {
    let isValid = true;

    if(reqData === null || reqData.ID === null || reqData.Title === null || reqData.MatchDayAmount === null || 
        reqData.MatchDayAmount === 0 || reqData.Teams === null || reqData.Teams.length === 1){
        isValid = false;
    }

    console.log("Value of Body: " + JSON.stringify(reqData));
    console.log("Value of ID: " + reqData.ID);
    console.log("Value of Title: " + reqData.Title);
    console.log("Body, ID and Title are Fine!");
    console.log("Value of MatchDayAmount: " + reqData.MatchDayAmount);
    console.log("MatchDayAmount is Fine!");
    console.log("Value of Teams: " + JSON.stringify(reqData.Teams));
    console.log("Teams are Fine!");
    
    return isValid;
}

//#endregion Validation functions

//#region Matchdays generation functions

const pairTeams = function(teams, id, matchDay) {
    if (teams.length < 2) { return []; }
    let homeTeam, awayTeams, matches;
    homeTeam = teams[0], awayTeams = teams.slice(1);
    if (matchDay % 2 == 0)
        matches = awayTeams.map(awayTeam => MatchDay.create(id, matchDay, homeTeam, awayTeam, null, null));
    else
        matches = awayTeams.map(awayTeam => MatchDay.create(id, matchDay, awayTeam, homeTeam, null, null));
    return matches.concat(pairTeams(awayTeams, id, matchDay));
}

//#endregion Matchdays generation functions

//#region Exports

exports.getAll = async (conObjects) => {
    const filter = {};

    const result = await findLeagues(getCol(conObjects), filter);

    return result;
};

exports.getById = async (conObjects, id) => {
    const filter = { "ID": id };

    const result = await findOneLeague(getCol(conObjects), filter);

    return result;
};

exports.insertLeague = async (conObjects, reqData) => {
    const isValid = validateCreateInput(reqData);
    let result = '';
    let league;

    if(isValid){
        league = League.create(reqData.ID, reqData.Title, reqData.MatchDayAmount, reqData.Teams);

        result = await insertOneLeague(getCol(conObjects), league);

        if(result.result.ok == 1){ result = league; }
    }
    else{
        result = 'Invalid data for leagues';
    }
    
    return { message: result, processed: isValid, league: league };
};

exports.deleteById = async (conObjects, id) => {
    const filter = { "ID": id };

    let result;
    
    try{
        result = await deleteOneLeague(getCol(conObjects), filter);
        console.log(result.n + " league document(s) deleted");

        result = await matchdayMod.deleteManyMatch(conObjects, id);
        console.log(result.n + " matchday document(s) deleted");
    }
    catch (error) {
        console.log(error);
    }

    return result;
};

exports.genMatchDays = async function (conObjects, league) {
    const leagueID = league.ID;
    const MDAmount = league.MatchDayAmount;
    const teams = league.Teams;
    let result;

    for (let i = 1; i <= MDAmount; i++) {
        let pairs = pairTeams(teams, leagueID, i);
        !result ? result = pairs : result.concat(pairs);
        await matchdayMod.insertManyMatch(conObjects, pairs);
    }
}

//#endregion Exports
