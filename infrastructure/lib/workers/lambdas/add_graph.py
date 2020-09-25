import boto3
import json
import kubernetes
import logging
import os
import random
import string

from table import TableItem

logger = logging.getLogger()
logger.setLevel(logging.INFO)

os.environ['PATH'] = '/opt/kubectl:/opt/helm:/opt/awscli:' + os.environ['PATH']

cluster_name = os.getenv("cluster_name")
graph_table_name = os.getenv("table_name")

def generate_password(length=8):
    """
    Generates a random password of a given length
    """
    printable = f'{string.ascii_letters}{string.digits}'

    # randomize
    printable = list(printable)
    random.shuffle(printable)

    # generate random password and convert to string
    random_password = random.choices(printable, k=length)
    random_password = ''.join(random_password)
    return random_password


def create_values(graph_name, schema, security_groups):
    """
    Generates the Json required to deploy the Gaffer Helm Chart
    """
    ingress_values = {
        "annotations": {
            "kubernetes.io/ingress.class": "alb",
            "alb.ingress.kubernetes.io/target-type": "ip",
            "alb.ingress.kubernetes.io/scheme": "internet-facing",
            "alb.ingress.kubernetes.io/security-groups": security_groups
        },
        "pathPrefix": "/*"
    }
    
    return {
        "graph": {
            "config": {
                "graphId": graph_name
            },
            "schema": {
                "elements.json": json.dumps(schema["elements"]),
                "types.json": json.dumps(schema["types"])
            }
        },
        "hdfs": {
            "ingress": ingress_values
        },
        "accumulo": {
            "config": {
                "accumuloSite": {
                    "instance.secret": generate_password() # todo store these somewhere secure in future ticket
                },
                "userManagement": {
                    "rootPassword": generate_password(),
                    "users": {
                        "gaffer": {
                            "password": generate_password(),
                            "permissions": {
                                "table": {
                                    graph_name: [
                                        "READ",
                                        "WRITE",
                                        "BULK_IMPORT",
                                        "ALTER_TABLE"
                                    ]
                                }
                            }
                        },
                        "tracer": {
                            "password": generate_password()
                        }
                    }
                }
            },
            "monitor": {
                "ingress": ingress_values
            }
        },
        "api": {
            "ingress": ingress_values
        }
    }


def deploy_graph(helm_client, body, security_groups):
    """
    Deploys a Gaffer graph onto a Kubernetes cluster using the Gaffer
    Helm Chart.
    """
    # Extract values from body
    graph_name = body["graphName"]
    release_name = body["releaseName"]
    namespace_name = body["namespaceName"]
    schema = body["schema"]
    expected_status = body["expectedStatus"]

    # Create TableItem to log progress of deployment
    index_key = {
        "releaseName": release_name,
        "namespaceName": namespace_name
    }
    graph = TableItem(graph_table_name, index_key)

    if not graph.check_status(expected_status):
        logger.warn("Deployment of %s abandoned as graph had unexpected status", graph_name)
        return

    # Update Status to DEPLOYMENT_IN_PROGRESS
    graph.update_status("DEPLOYMENT_IN_PROGRESS")

    # Create values file
    values = create_values(graph_name, schema, security_groups)
    
    values_file = "/tmp/" + graph_name + ".json"
    with open(values_file, "w") as f:
        f.write(json.dumps(values, indent=2))
        
    # Deploy Graph
    success = helm_client.install_chart(release_name, namespace_name, values=values_file)

    if success:
        logger.info("Deployment of %s Succeeded", graph_name)
        graph.update_status("DEPLOYED")
    else:
        graph.update_status("DEPLOYMENT_FAILED")


def handler(event, context):
    """
    Entrypoint for the Lambda
    """
    logger.info(event)

    helm_client = kubernetes.HelmClient(cluster_name)

    # Get Security Groups
    eks = boto3.client("eks")
    cluster = eks.describe_cluster(name=cluster_name)
    security_groups = cluster["cluster"]["resourcesVpcConfig"]["clusterSecurityGroupId"]
    extra_security_groups = os.getenv("extra_security_groups")
    
    if extra_security_groups is not None:
        security_groups = security_groups + ", " + extra_security_groups

    logger.info("Using security groups: %s", security_groups)

    # Run Deployments
    for record in event["Records"]:
        body = json.loads(record["body"])
        deploy_graph(helm_client, body, security_groups)

    return
