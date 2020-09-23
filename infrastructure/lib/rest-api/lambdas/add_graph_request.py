import boto3
from botocore.exceptions import ClientError
from graph import Graph
import json
import os
import re
from user import User

graph = Graph()
user = User()

def is_graph_name_valid(graph_name):
    if graph_name  is None:
        return False
    
    return re.match("^[a-zA-Z0-9]+$", graph_name) # Graph names have to be alphanumerics  


def handler(event, context):
    request_body = json.loads(event["body"])

    # Check request is valid
    graph_name = request_body["graphName"]
    schema = request_body["schema"]

    if not is_graph_name_valid(graph_name):
        return {
            "statusCode": 400,
            "body": "graphName is a required field which must made up of alphanumeric characters"
        }
    if schema is None:
        return {
            "statusCode": 400,
            "body": "schema is a required field"
        }

    # Get variables from env
    queue_url = os.getenv("sqs_queue_url")

    # Convert graph name to lowercase
    release_name = graph.format_graph_name(graph_name)

    initial_status = "DEPLOYMENT_QUEUED"

    administrators = []
    requesting_user = user.get_requesting_cognito_user(event)
    if requesting_user is not None:
        administrators.append(requesting_user)
    if "administrators" in request_body:
        administrators.extend(request_body["administrators"])
    if user.contains_duplicates(administrators):
        administrators = list(set(administrators))
    if not user.valid_cognito_users(administrators):
        return {
            "statusCode": 400,
            "body": "Not all of the supplied administrators are valid Cognito users: {}".format(str(administrators))
        }

    try:
        graph.create_graph(release_name, graph_name, initial_status, administrators)
    except ClientError as e:
        if e.response['Error']['Code']=='ConditionalCheckFailedException': 
            return {
                "statusCode": 400,
                "body": "Graph release name " + release_name + " already exists as the lowercase conversion of " + graph_name + ". Graph names must be unique"
            }
        else:
            return {
                "statusCode": 500,
                "body": json.dumps(e.response["Error"])
            }

    # Create message to send to worker. This also filters out anything else in the body
    message = {
        "graphName": graph_name,
        "releaseName": release_name,
        "schema": schema,
        "expectedStatus": initial_status,
        "endpoints":{}
    }

    sqs = boto3.client("sqs")
    sqs.send_message(QueueUrl=queue_url, MessageBody=json.dumps(message))

    return {
        "statusCode": 201
    }
