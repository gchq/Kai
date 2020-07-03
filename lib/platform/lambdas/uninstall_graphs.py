from crhelper import CfnResource
import json
import logging
import os
import boto3

logger = logging.getLogger(__name__)
helper = CfnResource(json_logging=False, log_level='DEBUG', boto_level='CRITICAL', sleep_on_delete=120)


try:
    get_graphs_function_arn = os.getenv("get_graphs_function_arn")
    delete_graph_function_arn = os.getenv("delete_graph_function_arn")
    client = boto3.client("lambda")
    pass
except Exception as e:
    helper.init_failure(e)


@helper.create
def create(event, context):
    logger.info("Got Create")
    return None


@helper.update
def update(event, context):
    logger.info("Got Update")


@helper.delete
def delete(event, context):
    logger.info("Got Delete")
    response = client.invoke(
        FunctionName = get_graphs_function_arn,
        InvocationType = "RequestResponse",
        Payload = json.dumps({ "pathParameters": None })
    )
    responsePayloadJson = json.loads(response["Payload"].read().decode("utf-8"))
    logger.info("Received responsePayloadJson: {}".format(responsePayloadJson))

    if responsePayloadJson["statusCode"] != 200:
        raise Exception("Unable to obtain listing of graphs received response code: {}".format(responsePayloadJson["statusCode"]))

    graphs = json.loads(responsePayloadJson["body"])

    logger.info("Deleting graphs: {}".format(graphs))

    payload = {
        "Records": list(map(graphToDeleteFormat, graphs))
    }

    logger.info("Payload for Deleting graphs: {}".format(payload))

    response = client.invoke(
        FunctionName = delete_graph_function_arn,
        InvocationType = "RequestResponse",
        Payload = json.dumps(payload)
    )
    logger.info("Received response: {}".format(response["Payload"].read().decode("utf-8")))


def graphToDeleteFormat(graph):
    return {
        "body": json.dumps({
            "graphId": graph["graphId"],
            "expectedStatus": graph["currentState"]
        })
    }


def handler(event, context):
    helper(event, context)
