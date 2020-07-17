The Kai REST API
=========================
The Kai REST API had a variety of endpoints. This will grow over time and this document should be kept up-to-date with any changes. If you notice something incorrect or out of date in this document, let us know via a [Github issue](https://github.com/gchq/Kai/issues/new).

## The Graphs resource
The Graphs resource enables creation, deletion and retrieval of Graphs managed by Kai.

### GET /graphs
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

### GET /graphs/{graphName}
Retrieves a single graph from the backend database. If the Graph Id is not found, a 404 response is sent.

Example response:
```json
{
    "graphName": "roadTraffic",
    "currentState": "DEPLOYED"
}
```

### POST /graphs
Creates and deploys a new graph. This endpoint is asynchronous meaning it will return before deploying a graph wich takes around 5 minutes. At present, you need to provide a Gaffer schema which is split into two parts: elements and types, as well as a graphName wich must be unique. This endpoint will respond with a simple 201 return code. If the user requests a graph which is already created, A 400 response will be sent, along with an error message. There is a constraint in gaffer-docker that graph ids have to be lowercase alphanumerics. We hope to address this in a bugfix to allow uppercase alphanumerics too.

Example request body:
```json
{
  "graphName": "basic",
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

### DELETE /graphs/{graphName}
Deletes a graph deployment from the platform. This endpoint is asynchronous meaning that it will respond before the graph deployment is removed. Once the graph deployment is removed, the graph will be removed from the backend database. If the requested graphName is not present or is not in the backend database at the start, a 400 error is returned, otherwise a 202 status code is returned.
