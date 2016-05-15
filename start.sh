#!/bin/bash

until netcat -z -w 2 rabbit 5672; do sleep 1; done

exec npm start

