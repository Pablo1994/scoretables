'use strict';
var express = require('express');
var router = express.Router();
const mongoMod = require('../../modules/mongomod');
const scoretablesMod = require('../../modules/scoretablesmod');

//#region Helper methods

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

//#endregion Helper methods

//#region Router methods

router.get("/:id", async function (req, res) {
    const conObjects = await getConnectionObjects(res);

    console.log('Received id: ' + req.params.id);

    const table = await scoretablesMod.getByLeague(conObjects, req.params.id);

    if (table) {
        ok(res, table);
    }
    else{
        bad(res, 'No league found with that ID');
    }

    conObjects.close();
});

//#endregion Router methods

module.exports = router;