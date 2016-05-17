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

        this._app.options('/', this.heartbeat);
        this._app.get('/:person_name', this.getPerson);
        this._app.post('/', this.postPerson.bind(this));

        this._server = this._app.listen(port);
        console.log('Application is ready');
    }
    close () {
        this._server.close();
    }

    heartbeat (req, res) {
        res.status(200).end();
    }
    getPerson (req, res) {
        if (req.error) {
            return res.status(req.error.code || 500).json({
                success: false,
                error: req.error.msg
            });
        }
        req.result.rest = process.env.HOSTNAME || 'Rest';
        res.json({
            success: true,
            response: req.result
        });
    }
    postPerson (req, res) {
        var query = {
            op: 'insert',
            name: req.body.name,
            age: req.body.age,
        }
        console.log(query)
        this._rabbitClient.rpc(JSON.stringify(query), function (err, msg) {
            var response = '';
            if (msg && msg.content) {
                msg = JSON.parse(msg.content.toString());
                console.log(` [.] Got ${msg.toString()}`);
                var response = msg;
            }
            if (err || !msg.success) {
                err = err || msg.error || 'Error occured';
                console.error(` [e] failed with ${err.msg}`);
                return res.status(err.code || 500).json({
                    success: false,
                    error: err.code? err.msg : err
                });
            }
            response.success && (response.response.rest = process.env.HOSTNAME || 'Rest');
            res.status(response.success? 201 : 500).json(response);
        });
    }

    fetchPersonMiddleware (request, response, next, person_name) {
        this.findPerson(person_name, (err, result) => {
            if (err) {
                request.error = {
                    msg: err.msg? err.msg : String(err),
                    code: err.code || 500
                }
                return next();
            }
            result = JSON.parse(result);
            if (!result.success) {
                request.error = result.error;
                return next();
            }
            request.result = result.response;
            return next();
        });
    }

    findPerson (name, callback) {
        var query = {
            op: 'select',
            name: name
        }
        this._rabbitClient.rpc(JSON.stringify(query), function (err, msg) {
            if (err) {
                console.error(` [e] failed with ${err.msg}`);
                return callback(err);
            }
            console.log(` [.] Got ${msg.content.toString()}`);
            callback(null, msg.content.toString());
        });
    }
}

module.exports = RestServer;

