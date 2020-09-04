import boto3
import os


class Graph:

    def __init__(self):
        dynamodb = boto3.resource("dynamodb")
        graph_table_name = os.getenv("graph_table_name")
        self.table = dynamodb.Table(graph_table_name)


    def format_graph_name(self, graph_name):
        return graph_name.lower()
        

    def get_all_graphs(self, requesting_user):
        """
        Gets all graphs from Dynamodb table
        """
        graphs = self.table.scan()["Items"]
        if requesting_user is None:
            return graphs
        else:
            return list(filter(lambda graph: requesting_user in graph["administrators"], graphs))


    def get_graph(self, graph_name):
        """
        Gets a specific graph from Dynamodb table
        """
        response = self.table.get_item(
            Key={
                "releaseName": format_graph_name(graph_name)
            }
        )
        if "Item" in response:
            return response["Item"]
        raise Exception


    def update_graph(self, release_name, status): 
        self.table.update_item(
            Key={
                "releaseName": release_name
            },
            UpdateExpression="SET currentState = :state",
            ExpressionAttributeValues={
                ":state": status
            },
            ConditionExpression=boto3.dynamodb.conditions.Attr("releaseName").exists()
        )

    def create_graph(self, release_name, graph_name, status, administrators):      
        self.table.put_item(
            Item={
                "graphName": graph_name,
                "releaseName": release_name,
                "currentState": status,
                "administrators": administrators
            },
            ConditionExpression=boto3.dynamodb.conditions.Attr("releaseName").not_exists()
        )