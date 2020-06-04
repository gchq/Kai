import boto3
import json
import os

def handler(event, context):
    request_body = json.loads(event["body"])

    graph_id = request_body["graphId"]
    schema = request_body["schema"]

    if graph_id is None:
        raise Exception("graphId is a required field")
    if schema is None:
        raise Exception("schema is a required field")

    sqs = boto3.client("sqs")
    queue_url = os.getenv("sqs_queue_url")

    # Filter out anything else in the body
    message = {
        "graphId": graph_id,
        "schema": schema
    }

    sqs.send_message(QueueUrl=queue_url, MessageBody=json.dumps(message))

    return {
        "statusCode": 201
    }
