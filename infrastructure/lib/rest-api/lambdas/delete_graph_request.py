import boto3
from botocore.exceptions import ClientError
from graph import Graph
import json
import os
from user import User

# Get variables from env
queue_url = os.getenv("sqs_queue_url")

graph = Graph()
user = User()

def handler(event, context):
    params = event["pathParameters"]

    # Check request is valid
    graph_name = params["graphName"]

    # Convert graph name to lowercase
    release_name = graph.format_graph_name(graph_name)    

    if graph_name is None:
        return {
            "statusCode": 400,
            "body": "graphName is a required field"
        }

    try:
        graph_record = graph.get_graph(release_name)
        requesting_user = user.get_requesting_cognito_user(event)
        if requesting_user and not requesting_user in graph_record["administrators"]:
            return {
                "statusCode": 403,
                "body": "User: {} is not authorized to delete graph: {}".format(requesting_user, graph_name)
            }
    except:
        return {
            "statusCode": 400,
            "body": "Graph " + graph_name + " does not exist. It may have already been deleted"
        }

    initial_status = "DELETION_QUEUED"

    # Add Entry to table
    try:
        graph.update_graph(release_name, initial_status)
    except ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            return {
                "statusCode": 400,
                "body": "Graph " + graph_name + " does not exist. It may have already been deleted"
            }
        else:
            return {
                "statusCode": 500,
                "body": json.dumps(e.response["Error"])
            }

    # Set the status so the worker knows what to expect. This also filters out anything else in the body
    message = {
        "graphName": graph_name,
        "releaseName": release_name,
        "expectedStatus": initial_status
    }

    sqs = boto3.client("sqs")
    sqs.send_message(QueueUrl=queue_url, MessageBody=json.dumps(message))

    return {
        "statusCode": 202
    }
