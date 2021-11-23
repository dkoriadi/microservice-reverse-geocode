#!/bin/bash
STAGE="dev"
 
cd "./../tf/deployments/$STAGE"
terraform init
# terraform fmt
# terraform validate
terraform apply -auto-approve
terraform output > "./../../../bash/output_aws.txt"
