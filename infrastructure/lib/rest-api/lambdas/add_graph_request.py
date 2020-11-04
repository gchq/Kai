import boto3
import json
import os
import re

from botocore.exceptions import ClientError
from graph import Graph
from namespace import Namespace
from user import User

graph = Graph()
namespace = Namespace()
user = User()

def is_graph_name_valid(graph_name):
    if graph_name  is None:
        return False
    
    return re.match("^[a-zA-Z0-9]+$", graph_name) # Graph names have to be alphanumerics  


def handler(event, context):
    request_body = json.loads(event["body"])

    # Check request is valid
    if "graphName" not in request_body or not is_graph_name_valid(request_body["graphName"]):
        return {
            "statusCode": 400,
            "body": "graphName is a required field which must made up of alphanumeric characters"
        }
    if "schema" not in request_body or request_body["schema"] is None:
        return {
            "statusCode": 400,
            "body": "schema is a required field"
        }
    if "namespaceName" not in request_body or not namespace.is_namespace_name_valid(request_body["namespaceName"]):
        return {
            "statusCode": 400,
            "body": "namespaceName is a required field which must be a valid DNS label"
        }

    graph_name = request_body["graphName"]
    schema = request_body["schema"]
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

    try:
        namespace_record = namespace.get_namespace(namespace_name)
        if not namespace_record["currentState"] == "DEPLOYED":
            return {
                "statusCode": 400,
                "body": "Graph: {} can not be added to Namespace {} as the namespace is not in a DEPLOYED state".format(graph_name, namespace_name)
            }
        if requesting_user is not None and not namespace_record["isPublic"] and not requesting_user in namespace_record["administrators"]:
            return {
                "statusCode": 403,
                "body": "User {} is not permitted to deploy a graph into namespace: {}".format(requesting_user, namespace_name)
            }

    except Exception as e:
        return {
            "statusCode": 400,
            "body": "Could not create graph, namespace: {} was not found".format(namespace_name)
        }


    # Get variables from env
    queue_url = os.getenv("sqs_queue_url")

    # Convert graph name to lowercase
    release_name = graph.format_graph_name(graph_name)

    initial_status = "DEPLOYMENT_QUEUED"

    try:
        graph.create_graph(release_name, graph_name, initial_status, administrators, namespace_name)
    except ClientError as e:
        if e.response['Error']['Code']=='ConditionalCheckFailedException': 
            return {
                "statusCode": 400,
                "body": "Graph release name: {} already exists in namespace: {}. Lowercase Graph names must be unique within a namespace.".format(release_name, namespace_name)
            }
        else:
            return {
                "statusCode": 500,
                "body": json.dumps(e.response["Error"])
            }

    # Create message to send to worker. This also filters out anything else in the body
    message = {
        "graphName": graph_name,
        "releaseName": release_name,
        "namespaceName": namespace_name,
        "schema": schema,
        "expectedStatus": initial_status,
        "endpoints":{}
    }

    sqs = boto3.client("sqs")
    sqs.send_message(QueueUrl=queue_url, MessageBody=json.dumps(message))

    return {
        "statusCode": 201
    }
