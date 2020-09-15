import os
import boto3
import json
from namespace import Namespace
from user import User

namespace = Namespace()
user = User()

def handler(event, context):
    path_params = event["pathParameters"]
    return_all = False
    namespace_name = None
    if path_params is None or path_params["namespaceName"] is None:
        return_all = True
    else:
        namespace_name = path_params["namespaceName"]

    requesting_user = user.get_requesting_cognito_user(event)

    if return_all:
        return {
            "statusCode": 200,
            "body": json.dumps(namespace.get_all_namespaces(requesting_user))
        }
    else:
        try:
            namespace_record = namespace.get_namespace(namespace_name)
            if requesting_user and not namespace_record["public"] and not requesting_user in namespace_record["administrators"]:
                return {
                    "statusCode": 403,
                    "body": "User: {} is not authorized to retrieve namespace: {}".format(requesting_user, namespace_name)
                }

            return {
                "statusCode": 200,
                "body": json.dumps(namespace_record)
            }
        except Exception as e:
            return {
                "statusCode": 404,
                "body": namespace_name + " was not found"
            }
