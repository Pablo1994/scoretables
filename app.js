'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var assert = require('assert');

var routes = require('./routes/index');
var api = require('./routes/api/api');
var leagues = require('./routes/api/leagues');
var matchdays = require('./routes/api/matchdays');
//var scoretables = require('./routes/api/scoretables');
var scoretablesView = require('./routes/scoretables');

const mongoMod = require('./modules/mongomod');

// Connection URL
const PORT = process.env.PORT || 3000;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/table', scoretablesView);
app.use('/api', api);
app.use('/api/leagues', leagues);
app.use('/api/matchdays', matchdays);
//app.use('/api/scoretables', scoretables);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', PORT);

var server = app.listen(PORT, async function () {
    debug('Express server listening on port ' + PORT);
    console.log('Express server listening on port ' + PORT);

    console.log(`Worker ${process.pid} started`);

    try {
        const connection = await mongoMod.connect();
        const message = 'Connected to server';
        console.log(message);

        connection.close();
    }
    catch (error) {
        console.log(error);
    }
});
