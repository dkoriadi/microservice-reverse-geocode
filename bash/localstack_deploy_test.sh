#!/bin/bash
STAGE="local"
 
cd "./../tf/deployments/$STAGE"
terraform init
# terraform fmt
# terraform validate
terraform apply -auto-approve
terraform output > "./../../../bash/output_localstack.txt"
cd "./../../../bash"
# --tty to enable colours
docker run --tty lambda-handler npm run integ-test