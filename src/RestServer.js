'use strict';

var express = require('express');
var assert = require('assert');
var RabbitClient = require('./RabbitClient');

const PORT = 8080;
const DEFAULT_NAME = 'Anonymous';

class RestServer {
    constructor (rabbitClient) {
        assert(rabbitClient instanceof RabbitClient);
        this.rabbitClient = rabbitClient;

        var app = express();

        app.param('person_name', this.fetchPersonMiddleware);
        app.get('/', this.getAnonymous);
        app.get('/:person_name', this.getPerson);

        app.listen(PORT);
        console.log('Application is ready');
    }
    getPerson (req, res) {
        res.json({
            success: true,
            response: req.greeting
        });
    }
    getAnonymous (req, res) {
        this.findPerson(DEFAULT_NAME, (err, result) => {
            if (err) {
                res.send(err);
                return;
            }
            res.json({
                success: true,
                response: result
            });
        });
    }
    fetchPersonMiddleware (request, response, next, person_name) {
        this.findPerson(person_name, (err, result) => {
            request.greeting = result;
            return next();
        });
    }
    findPerson (name, callback) {
        this.rabbitClient.rpc(name, function (err, msg) {
            if (err) {
                console.error(` [e] failed with ${err}`);
                return callback(err);
            }
            console.log(` [.] Got ${msg.content.toString()}`);
            callback(null, msg.content.toString());
        });
    }
}

//module.exports = init;
module.exports = RestServer;

