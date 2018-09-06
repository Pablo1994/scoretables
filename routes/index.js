'use strict';
var express = require('express');
var router = express.Router();

// GET home page. 
router.get('/', function (req, res) {
    const message = 'No view available.'
    console.log(message)
    res.send(message)
});

module.exports = router;
