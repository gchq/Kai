import boto3
from botocore.exceptions import ClientError
import json
from namespace import Namespace
import os
import re
from user import User

namespace = Namespace()
user = User()

def handler(event, context):
    request_body = json.loads(event["body"])

    # Check request is valid
    if "namespaceName" not in request_body or not namespace.is_namespace_name_valid(request_body["namespaceName"]):
        return {
            "statusCode": 400,
            "body": "namespaceName is a required field which must be a valid DNS label as defined in rfc-1123"
        }

    namespace_name = request_body["namespaceName"]

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

    if "isPublic" in request_body and request_body["isPublic"]:
        isPublic = True;
    else:
        isPublic = False;

    queue_url = os.getenv("sqs_queue_url")
    initial_status = "DEPLOYMENT_QUEUED"

    try:
        namespace.create_namespace(namespace_name, isPublic, administrators, initial_status)
    except ClientError as e:
        if e.response['Error']['Code']=='ConditionalCheckFailedException':
            return {
                "statusCode": 400,
                "body": "Namespace " + namespace_name + " already exists, Namespace names must be unique."
            }
        else:
            return {
                "statusCode": 500,
                "body": json.dumps(e.response["Error"])
            }

    # Create message to send to worker. This also filters out anything else in the body
    message = {
        "namespaceName": namespace_name,
        "expectedStatus": initial_status
    }

    sqs = boto3.client("sqs")
    sqs.send_message(QueueUrl=queue_url, MessageBody=json.dumps(message))

    return {
        "statusCode": 201
    }
