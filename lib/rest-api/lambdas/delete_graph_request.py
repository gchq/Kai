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
    graph_id = params["graphId"]

    if graph_id is None:
        return {
            statusCode: 400,
            body: "graphId is a required field"
        }

    requesting_user = user.get_requesting_cognito_user(event)
    if not user.is_authorized(requesting_user, graph_id):
        return {
            "statusCode": 403,
            "body": "User: {} is not authorized to delete graph: {}".format(requesting_user, graph_id)
        }

    initial_status = "DELETION_QUEUED"

    # Add Entry to table
    try:
        graph.update_graph(graph_id, initial_status)
    except ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            return {
                "statusCode": 400,
                "body": "Graph " + graph_id + " does not exist. It may have already been deleted"
            }
        else:
            return {
                "statusCode": 500,
                "body": json.dumps(e.response["Error"])
            }

    # Set the status so the worker knows what to expect. This also filters out anything else in the body
    message = {
        "graphId": graph_id,
        "expectedStatus": initial_status
    }

    sqs = boto3.client("sqs")
    sqs.send_message(QueueUrl=queue_url, MessageBody=json.dumps(message))

    return {
        "statusCode": 202
    }
