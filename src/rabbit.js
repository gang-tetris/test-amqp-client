'use strict';

var amqp = require('amqplib/callback_api');
var express = require('express');

var busConnect = require('./connection');
var callRemoteProcedure = require('./rpc');

var PORT = 8080;
var DEFAULT_NAME = 'Anonymous';

busConnect(function(err, channel, q) {
    var app = express();
    app.get('/', function (req, res) {
        console.log('GET');
        var name = req.query.name || DEFAULT_NAME;
        callRemoteProcedure(name, channel, q.queue, function (err, msg) {
            if (err) {
                console.error(' [e] failed with %j', err);
                res.send(err);
                return;
            }
            console.log(' [.] Got %s', msg.content.toString());
            res.send(msg.content.toString());
        });
    });

    app.listen(PORT);
    console.log('Running on port', PORT);
});

