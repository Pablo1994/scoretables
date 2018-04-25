'use strict';
var express = require('express');
var router = express.Router();
var request = require('request');

function initialize() {
    // Setting URL and headers for request
    var options = {
        url: 'https://scoretables.herokuapp.com/api/leagues',
      //  proxy: 'http://proxy-atc.atlanta.hp.com:8080 ',				// Comment or remove this line when uploading code
        headers: {
            'User-Agent': 'request'
        }
    };
    // Return new promise 
    return new Promise(function(resolve, reject) {
    	// Do async job
        request.get(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(body));
            }
        })
    })

}


// GET home page. 
router.get('/', function (req, res) {

	var initializePromise = initialize();
    initializePromise.then(function(result) {

		// Success
	    res.render('index', {
	    	title: "Score Table",
	        league: result
	    });

	    console.log("Successfully retrieved league data");
    }, function(err) {
        console.log(err);
    })
});


module.exports = router;
