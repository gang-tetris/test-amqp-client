'use strict';

var busConnect = require('./connection');
var restConnect = require('./rest');
var callRemoteProcedure = require('./rpc');

var client = {
    channel: null,
    queue: null,
    rpc: null
};

busConnect(function(err, channel, queue) {
    client.channel = channel;
    client.queue = queue.queue;
    client.rpc = callRemoteProcedure.bind(client, client.channel, client.queue);
    console.log('Rabbit connection is ready');
});

restConnect(client);

