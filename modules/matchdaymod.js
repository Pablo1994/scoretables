'use strict';
//var assert = require('assert');
const mongo = require('mongodb');
const MatchDay = require('../models/matchdaymodule');

const matchday_collection = 'matchdays';

//#region DB queries

const findOneMatch = async function (collection, filter) {
    let result;

    try { 
        result = await collection.findOne(filter);
    }
    catch (error) {
        console.log(error);
    }

    return result;
}

const findMatches = async function (collection, filter) {
    let result;

    try { 
        result = await collection.find(filter).toArray();
    }
    catch (error) {
        console.log(error);
    }

    return result;
}

const insertOneMatch = async function (collection, match) {
    let result;

    try { 
        result = await collection.insertOne(match);
    }
    catch (error) {
        console.log(error);
    }

    return result;
}

const insertManyMatch = async function (collection, documents) {
    let result;

    try { 
        result = await collection.insertMany(documents);
    }
    catch (error) {
        console.log(error);
    }

    return result;
}

const updateOneMatch = async function (collection, filter, updateValues) {
    let result;

    try { 
        const obj = await collection.updateOne(filter, updateValues);
        result = obj.result;
        console.log(result.nModified + " document(s) updated");
    }
    catch (error) {
        console.log(error);
    }

    return result;
}

const deleteOneMatch = async function (collection, filter) {
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

const deleteMatches = async function (collection, filter) {
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
    return conObjects.db.collection(matchday_collection);
}

//#endregion DB queries

//#region Exports

exports.getAll = async (conObjects) => {
    const filter = {};

    const result = await findMatches(getCol(conObjects), filter);

    return result;
};

exports.getByLeague = async (conObjects, leagueId) => {
    const filter = { "LeagueID": leagueId };

    const result = await findMatches(getCol(conObjects), filter);

    return result;
};

exports.getByLeagueMatchday = async (conObjects, leagueId, matchday) => {
    const filter = { "LeagueID": leagueId, "MatchDay": parseInt(matchday) };

    const result = await findMatches(getCol(conObjects), filter);

    return result;
};

exports.getById = async (conObjects, id) => {
    const o_id = new mongo.ObjectID(id);
    const filter = { "_id": o_id };

    const result = await findOneMatch(getCol(conObjects), filter);

    return result;
};

exports.insertMatchday = async (conObjects, reqData) => {
    const isValid = validateCreateInput(reqData);
    let result = '';
    let league;

    if(isValid){
        league = League.create(reqData.ID, reqData.Title, reqData.MatchDayAmount, reqData.Teams);

        result = await insertOneLeague(getCol(conObjects), league);
    }
    else{
        result = 'Invalid data for leagues';
    }
    
    return { message: result, processed: isValid, league: league };
};

exports.insertManyMatch = async (conObjects, matchdays) => {
    const result = await insertManyMatch(getCol(conObjects), matchdays);

    return result;
};

exports.updateById = async (conObjects, id, homescore, awayscore) => {
    const o_id = new mongo.ObjectID(id);
    const filter = { "_id": o_id };
    const newvalues = { $set: { HomeScore: homescore, AwayScore: awayscore, UpdateDate: new Date() } };

    const result = await updateOneMatch(getCol(conObjects), filter, newvalues);
    console.log(result.nModified + " matchday(s) updated");

    return result;
};

exports.deleteById = async (conObjects, id) => {
    const o_id = new mongo.ObjectID(id);
    const filter = { "_id": o_id };

    const result = await deleteOneMatch(getCol(conObjects), filter);
    console.log(result.n + " matchday(s) deleted");

    return result;
};

exports.deleteManyMatch = async (conObjects, leageId) => {
    const filter = { "LeagueID": leageId };

    const result = await deleteMatches(getCol(conObjects), filter);

    return result;
};

//#endregion Exports
