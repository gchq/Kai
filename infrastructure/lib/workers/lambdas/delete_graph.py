import json
import logging
import os
import time

from table import TableItem
from kubernetes import HelmClient, KubernetesClient

logger = logging.getLogger()
logger.setLevel(logging.INFO)

os.environ['PATH'] = '/opt/kubectl:/opt/helm:/opt/awscli:' + os.environ['PATH']

cluster_name = os.getenv("cluster_name")
graph_table_name = os.getenv("table_name")


def uninstall_release(helm_client, kubernetes_client, body):
    """
    Uninstalls a release from the Kubernetes Cluster
    """
    release_name = body["releaseName"]
    namespace_name = body["namespaceName"]
    expected_status = body["expectedStatus"]

    # Create a TableItem object to track the deletion
    index_key = {
        "releaseName": release_name,
        "namespaceName": namespace_name
    }
    graph = TableItem(graph_table_name, index_key)

    if not graph.check_status(expected_status):
        logger.warn("Graph %s had unexpected status. Abandoning delete", release_name)
        return

    graph.update_status("DELETION_IN_PROGRESS")

    uninstalled = helm_client.uninstall_chart(release_name, namespace_name)
    if uninstalled:
        kubernetes_client.delete_volumes(release_name, namespace_name);
        graph.delete()
    else:
        graph.update_status("DELETION_FAILED")


def handler(event, context):
    """
    The entrypoint for the Delete Graph Handler
    """
    logger.info(event)

    helm_client = HelmClient(cluster_name)
    kubernetes_client = KubernetesClient(cluster_name)
    for record in event["Records"]:
        body = json.loads(record["body"])
        uninstall_release(helm_client, kubernetes_client, body)
