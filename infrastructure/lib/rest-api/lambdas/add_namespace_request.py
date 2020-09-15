import boto3
from botocore.exceptions import ClientError
import json
from kubernetes import KubernetesClient
from namespace import Namespace
import os
import re
from user import User

namespace = Namespace()
user = User()

os.environ['PATH'] = '/opt/kubectl:/opt/helm:/opt/awscli:' + os.environ['PATH']

cluster_name = os.getenv("cluster_name")

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

    if "public" in request_body and request_body["public"]:
        public = True;
    else:
        public = False;

    try:
        if KubernetesClient(cluster_name).create_namespace(namespace_name):
            namespace.create_namespace(namespace_name, public, administrators)
            return {
                "statusCode": 201
            }
        else:
            return {
                "statusCode": 500,
                "body": "Could not create namespace: {}".format(namespace_name)
            }
    except ClientError as e:
        if e.response['Error']['Code']=='ConditionalCheckFailedException':
            return {
                "statusCode": 400,
                "body": "Namespace " + namespace_name + " already exists" + graph_name + ". Namespace names must be unique"
            }
        else:
            return {
                "statusCode": 500,
                "body": json.dumps(e.response["Error"])
            }
