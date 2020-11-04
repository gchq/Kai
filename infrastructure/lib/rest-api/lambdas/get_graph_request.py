import boto3
import json
import os

from graph import Graph
from user import User

graph = Graph()
user = User()

def handler(event, context):
    """
    Main entrypoint for the HTTP GET lambda functions. This function
    serves both GET handlers so returns all graphs if no graphName
    is specified in the path parameters
    """
    path_params = event["pathParameters"]
    return_all = False
    graph_name = None
    if path_params is None or path_params["graphName"] is None:
        return_all = True
    else:
        graph_name = path_params["graphName"]

    namespace_name = None
    if path_params is not None and "namespaceName" in path_params:
        namespace_name = path_params["namespaceName"]

    requesting_user = user.get_requesting_cognito_user(event)

    if return_all:
        return {
            "statusCode": 200,
            "body": json.dumps(graph.get_all_graphs(requesting_user, namespace_name))
        }
    else:
        try:
            graph_record = graph.get_graph(graph_name, namespace_name)
            if requesting_user and not requesting_user in graph_record["administrators"]:
                return {
                    "statusCode": 403,
                    "body": "User: {} is not authorized to retrieve graph: {} from namespace: {}".format(requesting_user, graph_name, namespace_name)
                }

            return {
                "statusCode": 200,
                "body": json.dumps(graph_record)
            }
        except Exception as e:
            return {
                "statusCode": 404,
                "body": "{} was not found in namespace {}".format(graph_name, namespace_name)
            }
