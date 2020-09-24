import boto3
import json
import os
import re

from botocore.exceptions import ClientError
from namespace import Namespace
from user import User

namespace = Namespace()
user = User()


def handler(event, context):
    params = event["pathParameters"]

    # Check request is valid
    namespace_name = params["namespaceName"]

    # Check request is valid
    if namespace_name is None or not namespace.is_namespace_name_valid(namespace_name):
        return {
            "statusCode": 400,
            "body": "namespaceName is a required field which must be a valid DNS label as defined in rfc-1123"
        }

    requesting_user = user.get_requesting_cognito_user(event)

    try:
        namespace_record = namespace.get_namespace(namespace_name)
        if requesting_user and not requesting_user in namespace_record["administrators"]:
            return {
                "statusCode": 403,
                "body": "User: {} is not authorized to update namespace: {}".format(requesting_user, namespace_name)
            }

        request_body = json.loads(event["body"])

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

        try:
            namespace.update_namespace(namespace_name, isPublic, administrators)
            return {
                "statusCode": 200
            }
        except ClientError as e:
            if e.response['Error']['Code']=='ConditionalCheckFailedException':
                return {
                    "statusCode": 400,
                    "body": "Namespace " + namespace_name + " already exists" + graph_name + ". Graph names must be unique"
                }
            else:
                return {
                    "statusCode": 500,
                    "body": json.dumps(e.response["Error"])
                }


    except Exception as e:
        return {
            "statusCode": 404,
            "body": namespace_name + " was not found"
        }
