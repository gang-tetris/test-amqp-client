'use strict';

var RabbitClient = require('./RabbitClient');
var restConnect = require('./rest');

var client = new RabbitClient();
client.connect(() => {
    restConnect(client);
});

