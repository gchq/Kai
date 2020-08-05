import boto3
import json
import os
from botocore.exceptions import ClientError

# Get variables from env
queue_url = os.getenv("sqs_queue_url")
graph_table_name = os.getenv("graph_table_name")

# Dynamodb table
dynamo = boto3.resource("dynamodb")
table = dynamo.Table(graph_table_name)

def format_graph_name(graph_name):
        return graph_name.lower()

def handler(event, context):
    params = event["pathParameters"]

    # Check request is valid
    graph_name = params["graphName"]

    # Convert graph name to lowercase
    release_name = format_graph_name(graph_name)    

    if graph_name is None:
        return {
            statusCode: 400,
            body: "graphName is a required field"
        }

    initial_status = "DELETION_QUEUED"

    # Add Entry to table
    try:
        table.update_item(
            Key={
                "releaseName": release_name
            },
            UpdateExpression="SET currentState = :state",
            ExpressionAttributeValues={
                ":state": initial_status
            },
            ConditionExpression=boto3.dynamodb.conditions.Attr("releaseName").exists()
        )
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
        "releaseName": release_name,
        "expectedStatus": initial_status
    }

    sqs = boto3.client("sqs")
    sqs.send_message(QueueUrl=queue_url, MessageBody=json.dumps(message))

    return {
        "statusCode": 202
    }
