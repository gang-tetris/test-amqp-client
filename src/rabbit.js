'use strict';

const PORT = 8080;

var RabbitClient = require('./RabbitClient');
var RestServer = require('./RestServer');

var rabbitClient = new RabbitClient();
var restServer = new RestServer(rabbitClient);
rabbitClient.connect().then(() => {
    restServer.connect(PORT);
}, console.error);

process.on('SIGINT', () => {
    rabbitClient.close();
    restServer.close();
    process.exit(0);
});

