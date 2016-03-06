'use strict';

var amqp = require('amqplib/callback_api');
var assert = require('assert');

var DEFAULT_HOST = 'amqp://rabbit';

function connect(host, callback) {
    if (typeof host === 'function') {
        callback = host;
        host = DEFAULT_HOST;
    }

    assert(!!host);
    assert(typeof callback === 'function');

    amqp.connect(host, function(err, conn) {
      conn.createChannel(function(err, channel) {
        channel.assertQueue('', {
            exclusive: true
        }, function (err, q) {
            if (err) {
                return callback(err);
            }
            callback(null, channel, q);
        });
      });
    });
};

module.exports = connect;

