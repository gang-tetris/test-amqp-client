'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var assert = require('assert');
var RabbitClient = require('./RabbitClient');

const DEFAULT_NAME = 'Anonymous';

class RestServer {
    constructor (rabbitClient) {
        assert(rabbitClient instanceof RabbitClient);
        this._rabbitClient = rabbitClient;
        this._app = express();
    }
    connect (port) {
        this._app.use(bodyParser.json());
        this._app.param('person_name', this.fetchPersonMiddleware.bind(this));
        this._app.get('/:person_name', this.getPerson);

        this._server = this._app.listen(port);
        console.log('Application is ready');
    }
    close () {
        this._server.close();
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
        this._rabbitClient.rpc(name, function (err, msg) {
            if (err) {
                console.error(` [e] failed with ${err}`);
                return callback(err);
            }
            console.log(` [.] Got ${msg.content.toString()}`);
            callback(null, msg.content.toString());
        });
    }
}

module.exports = RestServer;

