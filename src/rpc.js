'use strict';

var uuid4 = require('uuid4');

var TIMEOUT = 500;
var DEFAULT_QUEUE = 'rpc_queue';

function callRemoteProcedure(query, channel, queue, callback) {
    var correlationId = uuid4();

    var timeout = setTimeout(function () {
        channel.cancel(correlationId);
        callback('Timeout error');
    }, TIMEOUT);

    channel.consume(queue, function (msg) {
        if (msg.properties.correlationId !== correlationId) {
          console.log(' [i] Waiting for', correlationId,
                      'got', msg.properties.correlationId);
          return;
        }
        clearTimeout(timeout);
        channel.cancel(correlationId);
        callback(null, msg);
    }, {
        noAck: true,
        consumerTag: correlationId
    });

    channel.sendToQueue(DEFAULT_QUEUE, new Buffer(query), {
        correlationId: correlationId,
        replyTo: queue,
        expiration: TIMEOUT.toString()
    });
}

module.exports = callRemoteProcedure;

