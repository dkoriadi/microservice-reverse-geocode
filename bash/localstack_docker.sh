#!/bin/bash
EDGE_SERVICE_PORT="4566"

cd ..
docker build -t lambda-handler .
# --tty to enable colours
docker run --tty lambda-handler npm run test 

# --rm : Automatically remove the container when it exits
docker run --rm -p ${EDGE_SERVICE_PORT}:${EDGE_SERVICE_PORT} localstack/localstack