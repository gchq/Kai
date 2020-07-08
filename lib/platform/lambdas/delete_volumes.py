from crhelper import CfnResource
import json
import logging
import os
import boto3

logger = logging.getLogger(__name__)
helper = CfnResource(json_logging=False, log_level='DEBUG', boto_level='CRITICAL', sleep_on_delete=120)


try:
    cluster_name = os.getenv("cluster_name")
    client = boto3.client("ec2")
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
    logger.info("Got Delete for cluster: {}".format(cluster_name))

    volumes = client.describe_volumes(
        Filters= [
            {
                "Name": "tag:kubernetes.io/cluster/" + cluster_name,
                "Values": [
                    "owned"
                ]
            }
        ]
    )

    logger.info("Volumes: {}".format(volumes))

    for volume in volumes["Volumes"]:
        logger.info("Deleting volume: {}".format(volume["VolumeId"]))

        response = client.delete_volume(
            VolumeId = volume["VolumeId"],
            DryRun = False
        )
        logger.info("Received response: {}".format(response))


def handler(event, context):
    helper(event, context)
