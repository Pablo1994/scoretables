'use strict';
var assert = require('assert');

exports.basicTest = () => {
    const message = 'Service 2.0 Online';
    console.log(message);
};

exports.basicTestDB = (connection) => {
    const message = 'Connected to server';
    console.log(message);
    
    return message;
};