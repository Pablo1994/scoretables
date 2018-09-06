'use strict';
var express = require('express');
var assert = require('assert');
var router = express.Router();
const MatchDay = require('../../models/matchdaymodule');
const matchdayMod = require('../../modules/matchdaymod');
const mongoMod = require('../../modules/mongomod');

var debug = process.env.DEBUG_FLAG;

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

//#region Router methods

/* GET all MatchDays. */
router.get('/', async function (req, res) {
    const conObjects = await getConnectionObjects(res);

    const data = await matchdayMod.getAll(conObjects);

    ok(res, data);

    conObjects.close();
});

/* GET a League. */
router.get('/:id', async function (req, res) {
    const conObjects = await getConnectionObjects(res);

    console.log('Received id: ' + req.params.id);

    const data = await matchdayMod.getById(conObjects, req.params.id);

    ok(res, data);

    conObjects.close();
});

/* GET all MatchDays of a League. */
router.get('/league/:leagueid', async function (req, res) {
    const conObjects = await getConnectionObjects(res);

    console.log('Received leagueid: ' + req.params.leagueid);

    const data = await matchdayMod.getByLeague(conObjects, req.params.leagueid);

    ok(res, data);

    conObjects.close();
});

/* GET all MatchDays for a specific MatchDay count of a League. */
router.get('/league/:leagueid/:count', async function (req, res) {
    const conObjects = await getConnectionObjects(res);

    console.log('Received leagueid: ' + req.params.leagueid);

    console.log('Received count: ' + req.params.count);

    const data = await matchdayMod.getByLeagueMatchday(conObjects, req.params.leagueid,req.params.count);

    ok(res, data);

    conObjects.close();
});

/* PUT to update a MatchDay. */
router.put('/:id', async function (req, res) {
    const conObjects = await getConnectionObjects(res);

    console.log('Received id: ' + req.params.id);

    const result = await matchdayMod.updateById(conObjects, req.params.id, req.body.HomeScore, req.body.AwayScore);

    ok(res, result);

    conObjects.close();
});

 /* DELETE to delete a MatchDay. */
router.delete('/:id', async function (req, res) {
    const conObjects = await getConnectionObjects(res);

    console.log('Received id: ' + req.params.id);

    const result = await matchdayMod.deleteById(conObjects, req.params.id);

    ok(res, result);

    conObjects.close();
});


/* DELETE to delete MatchDay by League ID. */
router.delete('/league/:leagueid', async function (req, res) {
    const conObjects = await getConnectionObjects(res);

    console.log('Received leagueid: ' + req.params.leagueid);

    const result = await matchdayMod.deleteManyMatch(conObjects, req.params.leagueid);

    ok(res, result);

    conObjects.close();
});

//#endregion Router methods

module.exports = router;