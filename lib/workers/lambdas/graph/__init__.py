import boto3

class Graph:
    """
    Represents a Graph object in a DynamoDB table
    """
    def __init__(self, table_name, graph_id):
        dynamodb = boto3.resource("dynamodb")
        self.table = dynamodb.Table(table_name)
        self.graph_id = graph_id

    def check_status(self, expected_status):
        """
        Checks whether the graph has an expected status
        """
        response = self.table.get_item(
            Key={
                'graphId': self.graph_id
            },
            ProjectionExpression="status"
        )

        # If the graph does not exist, it cannot have the expected status
        graph = response["Item"]
        if graph is None:
            return False
        
        status = graph["status"]

        return status == expected_status

    def update_status(self, status):
        """
        Updates the status of a Graph
        """
        self.table.update_item(
            Key={
                "graphId": self.graph_id
            },
            UpdateExpression="SET status = :status",
            ExpressionAttributeValues={
                ":status": {"S": status }
            }
        )

    def delete(self):
        """
        Deletes the graph from the Table
        """
        self.table.delete_item(
        Key={
            "graphId": graph_id
        }
    )
