#!/bin/bash
STAGE="local"
 
cd "./../tf/deployments/$STAGE"
terraform init
# terraform fmt
# terraform validate
terraform apply -auto-approve
terraform output > "./../../../bash/output_localstack.txt"
cd "./../../../handlers"
npm install
npm run integ-test
