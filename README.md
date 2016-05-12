# Test AMQP client [![Build Status](https://travis-ci.org/gang-tetris/test-amqp-client.svg?branch=master)](https://travis-ci.org/gang-tetris/test-amqp-client)

Client for interaction via AMQP protocol.

Example `GET` query
```
curl -i -GET 0.0.0.0:8080/Anonymous
```

Example `POST` query
```
curl -i -H 'Content-type: application/json' \
        -d '{"name": "User", "age": 30}' \
        -POST 0.0.0.0:8080
```

