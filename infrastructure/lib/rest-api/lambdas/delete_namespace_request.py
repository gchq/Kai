import boto3
from botocore.exceptions import ClientError
import json
from namespace import Namespace
import os
from user import User

namespace = Namespace()
user = User()


def handler(event, context):
    params = event["pathParameters"]

    # Check request is valid
    namespace_name = params["namespaceName"]

    if namespace_name is None or not namespace.is_namespace_name_valid(namespace_name):
        return {
            "statusCode": 400,
            "body": "namespaceName is a required field which must be a valid DNS label"
        }

    try:
        namespace_record = namespace.get_namespace(namespace_name)
        requesting_user = user.get_requesting_cognito_user(event)
        if requesting_user and not requesting_user in namespace_record["administrators"]:
            return {
                "statusCode": 403,
                "body": "User: {} is not authorized to delete namespace: {}".format(requesting_user, namespace_name)
            }
    except:
        return {
            "statusCode": 400,
            "body": "Namespace " + namespace_name + " does not exist. It may have already have been deleted"
        }


    queue_url = os.getenv("sqs_queue_url")
    initial_status = "DELETION_QUEUED"


    # TODO Ensure there are no graphs deployed within this namespace.

    try:
        namespace.update_namespace_status(namespace_name, initial_status)
    except ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            return {
                "statusCode": 400,
                "body": "Namespace " + namespace_name + " does not exist. It may have already have been deleted"
            }
        else:
            return {
                "statusCode": 500,
                "body": json.dumps(e.response["Error"])
            }

    # Set the status so the worker knows what to expect. This also filters out anything else in the body
    message = {
        "namespaceName": namespace_name,
        "expectedStatus": initial_status
    }

    sqs = boto3.client("sqs")
    sqs.send_message(QueueUrl=queue_url, MessageBody=json.dumps(message))

    return {
        "statusCode": 202
    }