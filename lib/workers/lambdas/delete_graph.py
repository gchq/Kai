import os
import subprocess
import boto3
import json
import logging
from graphimport Graph
from kubernetesimport HelmClient

logger = logging.getLogger()
logger.setLevel(logging.INFO)

os.environ['PATH'] = '/opt/kubectl:/opt/helm:/opt/awscli:' + os.environ['PATH']

cluster_name = os.getenv("cluster_name")
graph_table_name = os.getenv("graph_table_name")


def uninstall_release(helm_client, body):
    """
    Uninstalls a release from the Kubernetes Cluster
    """
    graph_id = body["graphId"]
    expected_status=body["expectedStatus"]

    # Create a Graph object to track the deletion
    graph = Graph(graph_table_name, graph_id)

    if not graph.check_status(expected_status):
        logger.warn("Graph %s had unexpected status. Abandoning delete", graph_id)
        return

    graph.update_status("DELETE_IN_PROGRESS")

    uninstalled = helm_client.uninstall_chart(graph_id)
    if uninstalled:
        graph.delete()
    else:
        graph.update_status("DELETE_FAILED")

    
def handler(event, context):
    """
    The entrypoint for the Delete Graph Handler
    """
    logger.info(event)

    helm_client = HelmClient(cluster_name)
    for record in event["Records"]:
        body = json.loads(record["body"])
        uninstall_release(helm_client, body)