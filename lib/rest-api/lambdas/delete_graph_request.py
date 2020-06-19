import boto3
import json
import os
from botocore.exceptionsimport ClientError

# Get variables from env
queue_url = os.getenv("sqs_queue_url")
graph_table_name = os.getenv("graph_table_name")

# Dynamodb table
dynamo = boto3.resource("dynamodb")
table = dynamo.Table(graph_table_name)

def handler(event, context):
    params = event["pathParameters"]

    # Check request is valid
    graph_id = params["graphId"]

    if graph_id is None:
        return {
            statusCode: 400,
            body: "graphId is a required field"
        }

    initial_status = "DELETION_QUEUED"

    # Add Entry to table
    try:
        table.update_item(
            Key={
                "graphId": graph_id
            },
            UpdateExpression="SET currentState = :state",
            ExpressionAttributeValues={
                ":state": initial_status
            },
            ConditionExpression=boto3.dynamodb.conditions.Attr("graphId").exists()
        )
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
