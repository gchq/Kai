The Kai REST API
=========================
The Kai REST API exposes a number of endpoints whose access is restricted to members of the Kai User Pool.
Administration of graphs or namespaces created via the REST API is by default restricted to the creating user, additional users can be specified when the graph or namespace is created.
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
Retrieves all graphs objects from the backend database. At present this only includes the graphName, namespaceName, administrators and its current state but this is likely to change as the project grows.

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
        "namespaceName": "graph-development",
        "administrators": ["user1", "user2"],
        "currentState": "DEPLOYED"
    },
    {
        "graphName": "basicGraph",
        "namespaceName": "graph-testing",
        "administrators": ["user3"],
        "currentState": "DELETION_QUEUED"
    }
]
```

#### POST /graphs
Creates and deploys a new graph. This endpoint is asynchronous meaning it will return before deploying a graph which takes around 5 minutes. At present, you need to provide a Gaffer schema which is split into two parts: elements and types, a graphName and a namespaceName. The graphName must be unique within the namespaceName provided. This endpoint will respond with a simple 201 return code. If the user requests a graph which is already created in the supplied namespace, A 400 response will be sent, along with an error message. If the user attempts to create a graph in a namespace that does not exist, A 400 response will be sent, along with an error message. There is a constraint in gaffer-docker that graph names have to be lowercase alphanumerics. We hope to address this in a bugfix to allow uppercase alphanumerics too. By default only the creating user has administration access to the graph through the REST API. If you wish to specify additional users with administration privileges they can be listed in an optional "administrators" property. If an attempt is made to configure users who are not members of the Cognito User Pool a 400 response will be returned.

Example request body:
```json
{
  "graphName": "basic",
  "namespaceName": "graph-development",
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

### The Namespaces resource
The Namespaces resource enables creation, updating, deletion and retrieval of Kubernetes namespaces managed by Kai.
Administration of namespaces is restricted to the creating user and any configured administrators. Namespaces by default are private and only the creating user and administrators can deploy graphs to a private namespace. If the namespace is marked public then any user can deploy graphs to that namespace.

#### GET /namespaces
Retrieves all namespace objects from the backend database visible to the requesting user. This only includes the namespaceName, administrators, isPublic flag and its current state.

A namespace can be in different states. At present these states can be:
* DEPLOYMENT_QUEUED
* DEPLOYMENT_IN_PROGRESS
* DEPLOYED
* DEPLOYMENT_FAILED
* DELETION_QUEUED
* DELETION_FAILED
* DELETION_IN_PROGRESS

Once a namespace is undeployed, it is removed from the backend database

Example response:
```json
[
    {
        "namespaceName": "graph-development",
        "administrators": ["user1", "user2"],
        "isPublic": true,
        "currentState": "DEPLOYED"
    },
    {
        "namespaceName": "graph-testing",
        "administrators": ["user3"],
        "isPublic": false,
        "currentState": "DELETION_QUEUED"
    }
]
```

#### GET /namespaces/{namespaceName}
Retrieves a single namespace from the backend database. If the namespaceName is not found, a 404 response is sent. If the namespace is private and the requesting user is not a configured administrator of the graph a 403 response is returned.

Example response:
```json
{
    "namespaceName": "graph-development",
    "administrators": ["user1"],
    "isPublic": true,
    "currentState": "DEPLOYED"
}
```

#### POST /namespaces/{namespaceName}
Updates a namespace in the database. This endpoint can be used to update the list of administrators or change the visibility of the namespace. If the namespaceName is not found, a 404 response is sent. If the requesting user is not a configured administrator of the graph a 403 response is returned.

Example request body:
```json
{
    "administrators": ["user1"],
    "isPublic": false
}
```

#### DELETE /namespaces/{namespaceName}
Deletes a namespace in the database. This endpoint is asynchronous meaning that it will respond before the namespace is removed. Once the namespace is removed, the namespace will be removed from the backend database. If the namespaceName is not found, a 404 response is sent. If the requesting user is not a configured administrator of the graph a 403 response is returned. It is not possible to delete a namespace which contains graph deployments, if the namespace contains any graphs then a 400 response is returned. Otherwise a 202 status code is returned.

### The Namespace Graphs resource
The Namespaces Graphs resource enables updating, deletion and retrieval of graphs deployed to a Kubernetes namespace.

#### GET /namespaces/{namespaceName}/graphs
Retrieves the list of graphs deployed to a namespace.

Example response:
```json
[
    {
        "graphName": "roadTraffic1",
        "namespaceName": "graph-development",
        "administrators": ["user1"],
        "currentState": "DEPLOYED"
    },
    {
        "graphName": "roadTraffic2",
        "namespaceName": "graph-development",
        "administrators": ["user2"],
        "currentState": "DEPLOYED"
    }
]
```

#### GET /namespaces/{namespaceName}/graphs/{graphName}
Retrieves a single graph from the backend database. If the Graph Id is not found within the namespace, a 404 response is sent. If the requesting user is not a configured administrator of the graph a 403 response is returned.

Example response:
```json
{
    "graphName": "roadTraffic",
    "namespaceName": "graph-development",
    "administrators": ["user1"],
    "currentState": "DEPLOYED"
}
```

#### DELETE /namespaces/{namespaceName}/graphs/{graphName}
Deletes a graph deployment from the platform. This endpoint is asynchronous meaning that it will respond before the graph deployment is removed. Once the graph deployment is removed, the graph will be removed from the backend database. If the requested graphName is not present or is not in the backend database at the start, a 400 error is returned. If the user is not an administrator a 403 response is returned. Otherwise a 202 status code is returned.
