import boto3
from botocore.exceptions import ClientError
import json
import os
import re

def is_graph_id_valid(graph_id):
    if graph_id is None:
        return False
    
    return re.match("^[a-z0-9]+$", graph_id) # At present Graph ids have to be lowercase alphanumerics

def handler(event, context):
    request_body = json.loads(event["body"])

    # Check request is valid
    graph_id = request_body["graphId"]
    schema = request_body["schema"]

    if not is_graph_id_valid(graph_id):
        return {
            "statusCode": 400,
            "body": "graphId is a required field which must made up of lowercase alphanumeric characters"
        }
    if schema is None:
        return {
            "statusCode": 400,
            "body": "schema is a required field"
        }

    # Get variables from env
    queue_url = os.getenv("sqs_queue_url")
    graph_table_name = os.getenv("graph_table_name")

    # Add Entry to table
    dynamo = boto3.resource("dynamodb")
    table = dynamo.Table(graph_table_name)

    initial_status = "DEPLOYMENT_QUEUED"

    try:
        table.put_item(
            Item={
                "graphId": graph_id,
                "currentState": initial_status
            },
            ConditionExpression=boto3.dynamodb.conditions.Attr("graphId").not_exists()
        )
    except ClientError as e:
        if e.response['Error']['Code']=='ConditionalCheckFailedException': 
            return {
                "statusCode": 400,
                "body": "Graph " + graph_id + " already exists. Graph names must be unique"
            }
        else:
            return {
                "statusCode": 500,
                "body": json.dumps(e.response["Error"])
            }

    # Create message to send to worker. This also filters out anything else in the body
    message = {
        "graphId": graph_id,
        "schema": schema,
        "expectedStatus": initial_status
    }

    sqs = boto3.client("sqs")
    sqs.send_message(QueueUrl=queue_url, MessageBody=json.dumps(message))

    return {
        "statusCode": 201
    }
