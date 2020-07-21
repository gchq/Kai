import os
import boto3
from graph import Graph
import json
from user import User

graph = Graph()
user = User()


def handler(event, context):
    """
    Main entrypoint for the HTTP GET lambda functions. This function
    serves both GET handlers so returns all graphs if no graphId
    is specified in the path parameters
    """

    path_params = event["pathParameters"]
    return_all = False
    graph_id = None
    if path_params is None or path_params["graphId"] is None:
        return_all = True
    else:
        graph_id = path_params["graphId"]

    requesting_user = user.get_requesting_cognito_user(event)

    if return_all:
        return {
            "statusCode": 200,
            "body": json.dumps(graph.get_all_graphs(requesting_user))
        }
    else:
        if not user.is_authorized(requesting_user, graph_id):
            return {
                "statusCode": 403,
                "body": "User: {} is not authorized to retrieve graph: {}".format(requesting_user, graph_id)
            }

        try:
            return {
                "statusCode": 200,
                "body": json.dumps(graph.get_graph(graph_id))
            }
        except Exception as e:
            return {
                "statusCode": 404,
                "body": graph_id + " was not found"
            }
