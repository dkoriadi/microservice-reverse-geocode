# reverse-geocode-microservice

A serverless applcation that can be deployed into AWS cloud using Terraform (IaC).

## Table of contents
   * [Overview](#Overview)
   * [Getting Started](#Getting-Started)
   * [Usage](#Usage)
   * [Project Structure](#Project-Structure)
   * [Acknowledgements](#Acknowledgements)

## Overview

### AWS Lambda

The serverless application is an AWS Lambda that performs [reverse geocoding](https://en.wikipedia.org/wiki/Reverse_geocoding) by converting geographic coordinates into an address. The application can be invoked via AWS REST API Gateway. 

### AWS API Gateway with OAuth 2.0

The API Gateway endpoints are secured using the [OAuth 2.0](https://oauth.net/2/) protocol, specifically the [client crdentials flow](https://auth0.com/docs/authorization/flows/client-credentials-flow). There are two endpoints available once deployed:

`POST /oauth2`

This endpoint is used to obtain the access token which is needed for all subsequent requests.   

`GET /geocode` 

This endpoint is used to do the reverse geocoding.  

Refer to [Usage](#Usage) section for examples using the API Gateway and authentication via OAuth 2.0 protocol.

### Terraform

[Terraform](https://www.terraform.io/) is an infrastructure-as-code (IaC) tool that is used to manage the creation and deployment of all AWS infrastructure in this project.

For API Gateway, the resources are defined using a YAML/JSON [Swagger](https://swagger.io/docs/specification/about/) file that follows the OpenAPI standard. One key benefit for doing so (instead of creating Terraform resources) is modularity i.e. the resources can be easily ported to other cloud infrastructure services that support OpenAPI standards in the future if needed.


<p align="left">(<a href="#top">back to top</a>)</p>

## Getting Started

### Prerequisites

- npm
- [Docker](https://hub.docker.com/editions/community/docker-ce-desktop-windows)
- [Localstack](https://github.com/localstack/localstack)


### Installation

1. Clone this repo
```sh
git clone https://github.com/dkoriadi/reverse-geocode-microservice.git
```

2. Navigate to `bash` folder
```sh
cd bash
```

3. Unit test Lambda first
```sh
sh lambda_unit_tests.sh
``` 

4. Deploy on Localstack for integration testing
```sh
sh localstack_docker.sh # create docker container
sh localstack_deploy_test.sh # do this from another shell
``` 

5. Deploy on AWS cloud
```sh
sh aws_deploy.sh # select which stage within file
``` 

<p align="left">(<a href="#top">back to top</a>)</p>

## Usage


**Localstack example:**

(Example is using the default port 4566)

Step 1 - `POST /oauth2`:

Ensure `client_id` and `client_secret` is added into the file `handlers/oauth2/model.js`.

```sh
$ curl -d "client_id={id}&client_secret={secret}&grant_type=client_credentials" 
       -H "Content-Type: application/x-www-form-urlencoded" 
       -X POST "http://localhost:4566/restapis/id123/dev/_user_request_/v1/oauth2" 
```

Response as JSON object:

```sh
{
  "token_type": "Bearer",
  "expires_in": 3599,
  "access_token": {token}
}
```

Step 2 - `GET /geocode`:

Accepts two query string parameters:
- `lat` for latitude 
- `lon` for longitude

Also include the access token retrieved earlier into the request header.

```sh
$ curl -H "Accept: application/json"  
       -H "Authorization: Bearer {token}" 
       -X GET "http://localhost:4566/restapis/id123/dev/_user_request_/v1/geocode?lat={lat}&lon={lon}" 
```

Response as JSON object:

```sh
{
  "lat": string,
  "lon": string,
  "address": string
}
```

<p align="left">(<a href="#top">back to top</a>)</p>

## Project Structure

### Top-level directory

    .
    ├── bash                    # Bash scripts for testing and deploying
    ├── handlers                # Serverless application (AWS Lambda)
    └── tf                      # Terraform files


### Serverless application directory

    .
    ├── oauth2                  # Contains OAuth2 code
    |   ├── jwt-sign.js         # Generate access token/JSON Web token (JWT) using private key
    |   ├── jwt-verify.js       # Validate access token/JSON Web token (JWT) using public key
    |   ├── model.js            # Mock database to store credentials
    │   └── ...
    ├── tests                   # Contains all test files
    │   ├── integration         # Integration tests (test API GW and Lambda proxy integration)
    │   └── unit                # Unit tests for serverless application (AWS Lambda)
    ├── app.js                  # Entry point for serverless application
    └── ...


  ### Terraform directory
    .
    ├── deployments             # Choose from several types of deployments
    │   ├── local               # Localstack deployment
    │   ├── dev                 # AWS cloud deployment - dev stage
    │   └── prod                # AWS cloud deployment - prod stage
    └── modules                 # Resources split into modules for ease of development
        ├── lib                 # Third-party modules
        ├── svc-app-apig        # AWS API Gateway resources
        └── svc-app-lambda      # AWS Lambda resources

<p align="left">(<a href="#top">back to top</a>)</p>

## Acknowledgements

- [OpenStreetMap](https://nominatim.org/release-docs/latest/api/Reverse/)
- [A Detailed Overview of AWS API Gateway](https://www.alexdebrie.com/posts/api-gateway-elements/), probably the best guide ever to explain how AWS API GW works

<p align="left">(<a href="#top">back to top</a>)</p>
