'use strict';

var RabbitClient = require('./RabbitClient');
var RestServer = require('./RestServer');

var client = new RabbitClient();
client.connect().then(() => {
    var restServer = new RestServer(client);
}, console.error);

