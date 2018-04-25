'use strict';
var express = require('express');
var router = express.Router();
const League = require('../models/leaguemodule');
const MatchDay = require('../models/matchdaymodule');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
const league_collection = 'leagues';
const matchday_collection = 'matchdays';

// Connection URL
var mongoURL = process.env.MONGODB_URI;

/* GET generic. */
router.get('/hello', function (req, res) {

    res.send({ "message": "Hello World" });
});

module.exports = router;