'use strict';
var express = require('express');
var router = express.Router();
var request = require('request');

// GET home page. 
router.get('/', function (req, res) {

    // Create league options.
    
    // res.render('index', {
    //     title: "Score Table",
    //     league: null
    // });

    const message = 'No view available.'
    console.log(message)
    res.send(message)
});

module.exports = router;
