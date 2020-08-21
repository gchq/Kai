The Kai REST API
=========================
The Kai REST API exposes a number of endpoints whose access is restricted to members of the Kai User Pool.
Administration of graphs created via the REST API is by default restricted to the creating user, additional users can be specified when the graph is created.
The number of endpoints will grow over time and this document should be kept up-to-date with any changes. If you notice something incorrect or out of date in this document, let us know via a [Github issue](https://github.com/gchq/Kai/issues/new).

## Authorization
Access to the endpoints exposed by the Rest API is restricted to members of the Kai User Pool.
An Http request header containing a valid Cognito user identity token is required to invoke API endpoints via the execute-api. The mechanism for obtaining a token is dependent on the Cognito user pool configuration, the following example demonstrates how to create a user and obtain a token using the default Kai User Pool configuration.

```bash
#!/bin/bash

function userValueFor() {
    local _PROMPT="${1}"
    local _VALUE
    read -p "${_PROMPT}" _VALUE
    echo ${_VALUE}
}

while ([[ -z ${USER_POOL_ID} || -z ${APP_CLIENT_ID} || -z ${USERNAME} || -z ${PASSWORD} ]]) do
    [[ -z ${USER_POOL_ID} ]] && USER_POOL_ID=$(userValueFor "User Pool Id: ")
    [[ -z ${APP_CLIENT_ID} ]] && APP_CLIENT_ID=$(userValueFor "App Client Id: ")
    [[ -z ${USERNAME} ]] && USERNAME=$(userValueFor "Username: ")
    [[ -z ${PASSWORD} ]] && PASSWORD=$(userValueFor "Password: ")
done

# Create User
aws cognito-idp admin-create-user --user-pool-id ${USER_POOL_ID} --username ${USERNAME} || exit 1

# Set User Password
aws cognito-idp admin-set-user-password --user-pool-id ${USER_POOL_ID} --username ${USERNAME} --password ${PASSWORD} --permanent || exit 1

# Enable Admin User Password Authentication
aws cognito-idp update-user-pool-client --user-pool-id ${USER_POOL_ID} --client-id ${APP_CLIENT_ID} --explicit-auth-flows ALLOW_ADMIN_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH || exit 1

# Authenticate and obtain IdToken
aws cognito-idp admin-initiate-auth --user-pool-id ${USER_POOL_ID} --client-id ${APP_CLIENT_ID} --auth-flow ADMIN_USER_PASSWORD_AUTH --auth-parameters USERNAME=${USERNAME},PASSWORD=${PASSWORD} || exit 1
```

Once an IdToken has been obtained the Rest API endpoint can be called by passing the token in the "Authorization" header, for example using curl to retrieve all graphs:

```bash
curl -H "Authorization: <IdToken>" https://<restapi-id>.execute-api.<aws-region>.amazonaws.com/prod/graphs
```

## Endpoints

### The Graphs resource
The Graphs resource enables creation, deletion and retrieval of Graphs managed by Kai.

#### GET /graphs
Retrieves all graphs objects from the backend database. At present this only includes the graphName and its current state but this is likely to change as the project grows.

A graph can be in different states. At present these states can be:
* DEPLOYMENT_QUEUED
* DEPLOYMENT_IN_PROGRESS
* DEPLOYED
* DEPLOYMENT_FAILED
* DELETION_QUEUED
* DELETION_FAILED
* DELETION_IN_PROGRESS

Once a graph deployment is undeployed, it is removed from the backend database

Example response:
```json
[
    {
        "graphName": "roadTraffic",
        "currentState": "DEPLOYED"
    },
    {
        "graphName": "basicGraph",
        "currentState": "DELETION_QUEUED"
    }
]
```

#### GET /graphs/{graphName}
Retrieves a single graph from the backend database. If the Graph Id is not found, a 404 response is sent. If the requesting user is not a configured administrator of the graph a 403 response is returned.

Example response:
```json
{
    "graphName": "roadTraffic",
    "currentState": "DEPLOYED"
}
```

#### POST /graphs
Creates and deploys a new graph. This endpoint is asynchronous meaning it will return before deploying a graph which takes around 5 minutes. At present, you need to provide a Gaffer schema which is split into two parts: elements and types, as well as a graphName which must be unique. This endpoint will respond with a simple 201 return code. If the user requests a graph which is already created, A 400 response will be sent, along with an error message. There is a constraint in gaffer-docker that graph names have to be lowercase alphanumerics. We hope to address this in a bugfix to allow uppercase alphanumerics too. By default only the creating user has administration access to the graph through the REST API. If you wish to specify additional users with administration privileges they can be listed in an optional "administrators" property. If an attempt is made to configure users who are not members of the Cognito User Pool a 400 response will be returned.

Example request body:
```json
{
  "graphName": "basic",
  "administrators": [],
  "schema": {
    "elements": {
      "edges": {
        "BasicEdge": {
          "source": "vertex",
          "destination": "vertex",
          "directed": "true",
          "properties": {
            "count": "count"
          }
        }
      }
    },
    "types": {
      "types": {
        "vertex": {
          "class": "java.lang.String"
        },
        "count": {
          "class": "java.lang.Integer",
          "aggregateFunction": {
            "class": "uk.gov.gchq.koryphe.impl.binaryoperator.Sum"
          }
        },
        "true": {
          "description": "A simple boolean that must always be true.",
          "class": "java.lang.Boolean",
          "validateFunctions": [
            {
              "class": "uk.gov.gchq.koryphe.impl.predicate.IsTrue"
            }
          ]
        }
      }
    }
  }
}
```

#### DELETE /graphs/{graphName}
Deletes a graph deployment from the platform. This endpoint is asynchronous meaning that it will respond before the graph deployment is removed. Once the graph deployment is removed, the graph will be removed from the backend database. If the requested graphName is not present or is not in the backend database at the start, a 400 error is returned. If the user is not an administrator a 403 response is returned. Otherwise a 202 status code is returned.
