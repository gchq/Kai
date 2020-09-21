import json
from kubernetes import KubernetesClient
import logging
import os
from table import TableItem

logger = logging.getLogger()
logger.setLevel(logging.INFO)

os.environ['PATH'] = '/opt/kubectl:/opt/awscli:' + os.environ['PATH']

cluster_name = os.getenv("cluster_name")
namespace_table_name = os.getenv("table_name")


def delete_namespace(kubernetes_client, body):
    """
    Deletes a namespace from the Kubernetes Cluster
    """
    namespace_name = body["namespaceName"]
    expected_status = body["expectedStatus"]

    # Create a TableItem object to track the namespace deletion
    namespace = TableItem(namespace_table_name, "namespaceName", namespace_name)

    if not namespace.check_status(expected_status):
        logger.warn("Namespace %s had unexpected status. Abandoning delete", namespace_name)
        return

    namespace.update_status("DELETION_IN_PROGRESS")

    if kubernetes_client.delete_namespace(namespace_name):
        namespace.delete()
    else:
        namespace.update_status("DELETION_FAILED")


def handler(event, context):
    logger.info(event)

    kubernetes_client = KubernetesClient(cluster_name)
    for record in event["Records"]:
        body = json.loads(record["body"])
        delete_namespace(kubernetes_client, body)
