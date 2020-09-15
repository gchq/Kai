import boto3
from botocore.exceptions import ClientError
import json
from kubernetes import KubernetesClient
from namespace import Namespace
import os
from user import User

namespace = Namespace()
user = User()

os.environ['PATH'] = '/opt/kubectl:/opt/helm:/opt/awscli:' + os.environ['PATH']

cluster_name = os.getenv("cluster_name")

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
        if requesting_user and not namespace_record["public"] and not requesting_user in namespace_record["administrators"]:
            return {
                "statusCode": 403,
                "body": "User: {} is not authorized to delete namespace: {}".format(requesting_user, namespace_name)
            }
    except:
        return {
            "statusCode": 400,
            "body": "Namespace " + namespace_name + " does not exist. It may have already have been deleted"
        }

    # TODO Ensure there are no graphs deployed within this namespace.

    try:
        if KubernetesClient(cluster_name).delete_namespace(namespace_name):
            namespace.delete(namespace_name)
            return {
                "statusCode": 204
            }
        else:
            return {
                "statusCode": 500,
                "body": "Could not delete namespace: {}".format(namespace_name)
            }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": "Could not delete namespace: {}".format(namespace_name)
        }
