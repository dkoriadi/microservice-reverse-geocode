#!/bin/bash

# Workaround for SAM CLI bug
cd "./../Handlers" 
cd ..
sam build
sam local start-api -l log.txt
# sam local start-api -n env.json -l log.txt
