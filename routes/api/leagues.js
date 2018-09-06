'use strict';
var express = require('express');
var router = express.Router();
const mongoMod = require('../../modules/mongomod');
const leagueMod = require('../../modules/leaguesmod');

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

/* GET all Leagues. */
router.get('/', async function (req, res) {
    const conObjects = await getConnectionObjects(res);

    const data = await leagueMod.getAll(conObjects);

    ok(res, data);

    conObjects.close();
});

/* GET a League. */
router.get('/:id', async function (req, res) {
    const conObjects = await getConnectionObjects(res);

    console.log('Received id: ' + req.params.id);

    const data = await leagueMod.getById(conObjects, req.params.id);

    ok(res, data);

    conObjects.close();
});

/* POST a League. */
router.post('/', async function (req, res) {
    const conObjects = await getConnectionObjects(res);

    console.log("router.post leagues");

    const search = await leagueMod.getById(conObjects, req.body.ID);

    if (search == null || search.length == 0) {
        console.log("Good!! Now we insert the League");
        const result = await leagueMod.insertLeague(conObjects, req.body);
        if(result.processed){
            await leagueMod.genMatchDays(conObjects, result.league);
            ok(res, result.message);
        }
        else{
            bad(res, result.message);
        }
    }
    else {
        bad(res, "League already exists");
    }

    conObjects.close();
});

/* DELETE to delete a League. */
router.delete('/:id', async function (req, res) {
    const conObjects = await getConnectionObjects(res);

    console.log('Received id: ' + req.params.id);

    const result = await leagueMod.deleteById(conObjects, req.params.id);

    ok(res, result);

    conObjects.close();
});

//#endregion Router methods

module.exports = router;