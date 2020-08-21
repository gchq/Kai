from crhelper import CfnResource
import json
import logging
import os
import boto3

logger = logging.getLogger(__name__)
helper = CfnResource(json_logging=False, log_level='DEBUG', boto_level='CRITICAL', sleep_on_delete=120)


try:
    get_graphs_function_arn = os.getenv("get_graphs_function_arn")
    client = boto3.client("lambda")
    pass
except Exception as e:
    helper.init_failure(e)


def getGraphs():
    logger.info("Getting graphs")
    response = client.invoke(
        FunctionName = get_graphs_function_arn,
        InvocationType = "RequestResponse",
        Payload = json.dumps({ "pathParameters": None })
    )
    responsePayloadJson = json.loads(response["Payload"].read().decode("utf-8"))
    logger.info("Received responsePayloadJson: {}".format(responsePayloadJson))

    if responsePayloadJson["statusCode"] != 200:
        raise Exception("Unable to obtain listing of graphs received response code: {}".format(responsePayloadJson["statusCode"]))

    return json.loads(responsePayloadJson["body"])


def handler(event, context):
    if ("RequestType" in event and event["RequestType"] == "Delete"):
        isComplete = (len(getGraphs()) == 0)
    else:
        isComplete = True
    return { "IsComplete": isComplete }
