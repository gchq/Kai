import os
import subprocess
import json
import boto3

os.environ['PATH'] = '/opt/kubectl:/opt/helm:/opt/awscli:' + os.environ['PATH']
kubeconfig = "/tmp/kubeconfig"

def create_values(graph_id, schema, security_groups):
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
                "graphId": graph_id
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
                    "instance.secret": "DEFAULT" # todo Make these random and store somewhere secure
                },
                "userManagement": {
                    "rootPassword": "root",
                    "users": {
                        "gaffer": {
                            "password": "gaffer",
                            "permissions": {
                                "table": {
                                    graph_id: [
                                        "READ",
                                        "WRITE",
                                        "BULK_IMPORT",
                                        "ALTER_TABLE"
                                    ]
                                }
                            }
                        },
                        "tracer": {
                            "password": "tracer"
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


def add_graph(body, security_groups):
    # Extract values from body
    graph_id = body["graphId"]
    schema = body["schema"]
    
    # Create a Namespace
    subprocess.run(["kubectl", "create", "namespace", graph_id, 
        "--kubeconfig", kubeconfig
    ])

    # Create values file
    values = create_values(graph_id, schema, security_groups)
    
    values_file = "/tmp/" + graph_id + ".json"
    with open(values_file, "w") as f:
        f.write(json.dumps(values, indent=2))
        
    # Deploy Graph
    try:
        subprocess.run([ "helm", "upgrade", "gaffer", "gaffer", 
            "--repo", "https://gchq.github.io/gaffer-docker",
            "--install",
            "--kubeconfig", kubeconfig,
            "--values", values_file,
            "--namespace", graph_id
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=True, cwd="/tmp")
    except subprocess.CalledProcessError as err:
        raise Exception(err.output)

    print("Deployment of " + graph_id + " Succeeded")
    

def handler(event, context):
    print(event)

    # Log in to the cluster
    cluster_name = os.getenv("cluster_name")
    subprocess.check_call([ 'aws', 'eks', 'update-kubeconfig',
        '--name', cluster_name,
        '--kubeconfig', kubeconfig
    ])

    # Get Security Groups
    eks = boto3.client("eks")
    cluster = eks.describe_cluster(name=cluster_name)
    security_groups = cluster["cluster"]["resourcesVpcConfig"]["clusterSecurityGroupId"]
    extra_security_groups = os.getenv("extra_security_groups")
    
    if extra_security_groups is not None:
        security_groups = security_groups + ", " + extra_security_groups

    for record in event["Records"]:
        body = json.loads(record["body"])
        add_graph(body, security_groups)
        
    return