'use strict';

var amqp = require('amqplib');
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
    connect () {
        return amqp.connect(this._host).then((conn) => {
            return conn.createChannel();
        }).then((channel) => {
            this._channel = channel;
            return channel.assertQueue('', {
                exclusive: true
            });
        }).then((queue) => {
            this._queue = queue.queue;
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
            consume(this._channel, msg, correlationId, timeout, callback);
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

function consume (channel, msg, correlationId, timeout, callback) {
    if (msg.properties.correlationId !== correlationId) {
      console.log(` [i] Waiting for ${correlationId} got ${msg.properties.correlationId}`);
      return;
    }
    clearTimeout(timeout);
    channel.cancel(correlationId);
    callback(null, msg);
}

module.exports = RabbitClient;

