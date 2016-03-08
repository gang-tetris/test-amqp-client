'use strict';

var express = require('express');
var assert = require('assert');

var callRemoteProcedure = require('./rpc');

var PORT = 8080;
var DEFAULT_NAME = 'Anonymous';

var settings = {
    client: {
        channel: null,
        queue: null,
        rpc: null
    }
};

function get (req, res) {
    assert(!!settings.client);
    assert(!!settings.client.channel && !!settings.client.queue);
    assert(typeof settings.client.rpc === 'function');

    console.log('GET');
    var name = req.query.name || DEFAULT_NAME;
    settings.client.rpc(name, function (err, msg) {
        if (err) {
            console.error(' [e] failed with %j', err);
            res.send(err);
            return;
        }
        console.log(' [.] Got %s', msg.content.toString());
        res.send(msg.content.toString());
    });
}

function init (client) {
    settings.client = client;

    var app = express();

    app.get('/', get);

    app.listen(PORT);
    console.log('Application is ready');
}

module.exports = init;

