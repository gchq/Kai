import boto3
import os


class Graph:

    def __init__(self):
        dynamodb = boto3.resource("dynamodb")
        graph_table_name = os.getenv("graph_table_name")
        self.table = dynamodb.Table(graph_table_name)


    def get_all_graphs(self, requesting_user):
        """
        Gets all graphs from Dynamodb table
        """
        graphs = self.table.scan()["Items"]
        if requesting_user is None:
            return graphs
        else:
            return list(filter(lambda graph: requesting_user in graph["administrators"], graphs))


    def get_graph(self, graph_id):
        """
        Gets a specific graph from Dynamodb table
        """
        response = self.table.get_item(
            Key={
                "graphId": graph_id
            }
        )
        if "Item" in response:
            return response["Item"]
        raise Exception


    def update_graph(self, graph_id, status):
        self.table.update_item(
            Key={
                "graphId": graph_id
            },
            UpdateExpression="SET currentState = :state",
            ExpressionAttributeValues={
                ":state": status
            },
            ConditionExpression=boto3.dynamodb.conditions.Attr("graphId").exists()
        )

    def create_graph(self, graph_id, status, administrators):
        self.table.put_item(
            Item={
                "graphId": graph_id,
                "currentState": status,
                "administrators": administrators
            },
            ConditionExpression=boto3.dynamodb.conditions.Attr("graphId").not_exists()
        )

