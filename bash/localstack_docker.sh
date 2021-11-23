#!/bin/bash
EDGE_SERVICE_PORT="4566"

# --rm : Automatically remove the container when it exits
docker run --rm -p ${EDGE_SERVICE_PORT}:${EDGE_SERVICE_PORT} localstack/localstack