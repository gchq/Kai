import os
import subprocess
import boto3
import json
import logging
import time
from graph import Graph
from kubernetes import HelmClient

logger = logging.getLogger()
logger.setLevel(logging.INFO)

os.environ['PATH'] = '/opt/kubectl:/opt/helm:/opt/awscli:' + os.environ['PATH']

cluster_name = os.getenv("cluster_name")
graph_table_name = os.getenv("graph_table_name")
ec2 = boto3.client("ec2")


def uninstall_release(helm_client, body):
    """
    Uninstalls a release from the Kubernetes Cluster
    """
    release_name = body["releaseName"]
    expected_status=body["expectedStatus"]

    # Create a Graph object to track the deletion
    graph = Graph(graph_table_name, release_name)

    if not graph.check_status(expected_status):
        logger.warn("Graph %s had unexpected status. Abandoning delete", release_name)
        return

    graph.update_status("DELETION_IN_PROGRESS")

    uninstalled = helm_client.uninstall_chart(release_name)
    if uninstalled:
        delete_volumes(release_name);
        graph.delete()
    else:
        graph.update_status("DELETION_FAILED")


def delete_volumes(release_name):
    created_for_pvc_name_filter_values = [
        "data*-{}-hdfs-datanode-*".format(release_name),
        "data*-{}-hdfs-namenode-*".format(release_name),
        "data*-{}-zookeeper-*".format(release_name)
    ]
    filters = [
        {
            "Name": "tag:kubernetes.io/cluster/" + cluster_name,
            "Values": [ "owned" ]
        },
        {
            "Name": "tag:kubernetes.io/created-for/pvc/name",
            "Values": created_for_pvc_name_filter_values
        }
    ]
    volumes = ensure_volumes_detached_for_filters(filters)

    logger.info("Deleting volumes: {}".format(volumes))

    for volume in volumes["Volumes"]:
        logger.info("Deleting volume: {}".format(volume["VolumeId"]))

        response = ec2.delete_volume(
            VolumeId = volume["VolumeId"]
        )
        logger.info("Received response: {}".format(response))


def ensure_volumes_detached_for_filters(filters):
    unavailable_volumes = True
    while unavailable_volumes:
        volumes = ec2.describe_volumes(
            Filters = filters
        )
        unavailable_volumes = False
        for volume in volumes["Volumes"]:
            if volume["State"] != "available":
                unavailable_volumes = True
                break;
        if unavailable_volumes:
            logger.info("Waiting for Volumes to detach before attempting to delete.")
            time.sleep(10)
        else:
            return volumes


def handler(event, context):
    """
    The entrypoint for the Delete Graph Handler
    """
    logger.info(event)

    helm_client = HelmClient(cluster_name)
    for record in event["Records"]:
        body = json.loads(record["body"])
        uninstall_release(helm_client, body)
