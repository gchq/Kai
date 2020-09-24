import json
import logging
import os

from kubernetes import KubernetesClient
from table import TableItem

logger = logging.getLogger()
logger.setLevel(logging.INFO)

os.environ['PATH'] = '/opt/kubectl:/opt/awscli:' + os.environ['PATH']

cluster_name = os.getenv("cluster_name")
namespace_table_name = os.getenv("table_name")

def deploy_namespace(kubernetes_client, body):
    """
    Deploys a Kubernetes namespace.
    """
    # Extract values from body
    namespace_name = body["namespaceName"]
    expected_status = body["expectedStatus"]

    # Create Graph to log progress of deployment
    index_key = {
        "namespaceName": namespace_name
    }
    namespace = TableItem(namespace_table_name, index_key)

    if not namespace.check_status(expected_status):
        logger.warn("Deployment of %s abandoned as namespace had unexpected status", namespace_name)
        return

    # Update Status to DEPLOYMENT_IN_PROGRESS
    namespace.update_status("DEPLOYMENT_IN_PROGRESS")

    if kubernetes_client.create_namespace(namespace_name):
        logger.info("Deployment of " + namespace_name + " Succeeded")
        namespace.update_status("DEPLOYED")
    else:
        namespace.update_status("DEPLOYMENT_FAILED")


def handler(event, context):
    logger.info(event)

    kubernetes_client = KubernetesClient(cluster_name)

    # Run Deployments
    for record in event["Records"]:
        body = json.loads(record["body"])
        deploy_namespace(kubernetes_client, body)

    return
