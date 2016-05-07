'use strict';

var amqp = require('amqplib/callback_api');
var uuid4 = require('uuid4');
var assert = require('assert');

const DEFAULT_HOST = 'amqp://rabbit';
const DEFAULT_QUEUE = 'rpc_queue';
const TIMEOUT = 500;

class RabbitClient {
    constructor (host) {
        assert(!host || typeof host === 'string');
        this._host = host || DEFAULT_HOST;
    }
    connect (callback) {
        assert(typeof callback === 'function');

        amqp.connect(this._host, (err, conn) => {
            conn.createChannel((err, channel) => {
                channel.assertQueue('', {
                    exclusive: true
                }, (err, queue) => {
                    if (err) {
                        return callback(err);
                    }
                    this._channel = channel;
                    this._queue = queue.queue;
                    callback(null);
                });
            });
        });
    }
    rpc (query, callback) {
        assert(!!this._channel && !!this._queue);
        assert(typeof query === 'string' && typeof callback === 'function');

        var correlationId = uuid4();

        var timeout = setTimeout(() => {
            this._channel.cancel(correlationId);
            callback('Timeout error');
        }, TIMEOUT);

        this._channel.consume(this._queue, (msg) => {
            if (msg.properties.correlationId !== correlationId) {
              console.log(` [i] Waiting for ${correlationId} got ${msg.properties.correlationId}`);
              return;
            }
            clearTimeout(timeout);
            this._channel.cancel(correlationId);
            callback(null, msg);
        }, {
            noAck: true,
            consumerTag: correlationId
        });

        this._channel.sendToQueue(DEFAULT_QUEUE, new Buffer(query), {
            correlationId: correlationId,
            replyTo: this._queue,
            expiration: TIMEOUT.toString()
        });
    }
}

module.exports = RabbitClient;

