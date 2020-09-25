import boto3
import os

from boto3.dynamodb.conditions import Attr


class Graph:

    def __init__(self):
        dynamodb = boto3.resource("dynamodb")
        graph_table_name = os.getenv("graph_table_name")
        self.table = dynamodb.Table(graph_table_name)


    def format_graph_name(self, graph_name):
        return graph_name.lower()


    def get_all_graphs(self, requesting_user, namespace_name):
        """
        Gets all graphs from Dynamodb table
        """
        graphs = self.table.scan()["Items"]

        if requesting_user is not None:
            graphs = list(filter(lambda graph: requesting_user in graph["administrators"], graphs))

        if namespace_name is not None:
            graphs = list(filter(lambda graph: namespace_name == graph["namespaceName"], graphs))

        return graphs


    def get_graph(self, graph_name, namespace_name):
        """
        Gets a specific graph from Dynamodb table
        """
        response = self.table.get_item(
            Key={
                "releaseName": self.format_graph_name(graph_name),
                "namespaceName": namespace_name
            }
        )
        if "Item" in response:
            return response["Item"]
        raise Exception


    def update_graph(self, release_name, namespace_name, status):
        self.table.update_item(
            Key={
                "releaseName": release_name,
                "namespaceName": namespace_name
            },
            UpdateExpression="SET currentState = :state",
            ExpressionAttributeValues={
                ":state": status
            },
            ConditionExpression=Attr("releaseName").exists() & Attr("namespaceName").exists()
        )

    def create_graph(self, release_name, graph_name, status, administrators, namespace_name):
        self.table.put_item(
            Item={
                "graphName": graph_name,
                "releaseName": release_name,
                "namespaceName": namespace_name,
                "currentState": status,
                "administrators": administrators
            },
            ConditionExpression=Attr("releaseName").not_exists() | Attr("namespaceName").not_exists()
        )
