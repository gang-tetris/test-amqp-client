'use strict';

var express = require('express');
var assert = require('assert');
var RabbitClient = require('./RabbitClient');

const PORT = 8080;
const DEFAULT_NAME = 'Anonymous';

var settings = {
    client: null
};

function get (req, res) {
    assert(typeof settings.client.rpc === 'function');

    var name = req.query.name || DEFAULT_NAME;
    settings.client.rpc(name, function (err, msg) {
        if (err) {
            console.error(` [e] failed with ${err}`);
            res.send(err);
            return;
        }
        console.log(` [.] Got ${msg.content.toString()}`);
        res.send(msg.content.toString());
    });
}

function init (client) {
    assert(client instanceof RabbitClient);
    settings.client = client;

    var app = express();

    app.get('/', get);

    app.listen(PORT);
    console.log('Application is ready');
}

module.exports = init;

