'use strict';
var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

// Connection URL
var mongoURL = process.env.MONGODB_URI;

/* GET generic. */
router.get('/hello', function (req, res) {

    res.send({ "message": "Hello World" });
});

module.exports = router;