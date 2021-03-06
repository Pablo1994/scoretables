﻿'use strict';
var express = require('express');
var router = express.Router();
const apiMod = require('../../modules/apimod');
const mongoMod = require('../../modules/mongomod');

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

//#endregion Router methods

module.exports = router;