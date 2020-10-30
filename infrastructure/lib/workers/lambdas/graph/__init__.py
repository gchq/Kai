import boto3
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class Graph:
    """
    Represents a Graph object in a DynamoDB table
    """
    def __init__(self, table_name, release_name):
        dynamodb = boto3.resource("dynamodb")
        self.table = dynamodb.Table(table_name)
        self.release_name = release_name

    def check_status(self, expected_status):
        """
        Checks whether the graph has an expected status
        """
        response = self.table.get_item(
            Key={
                "releaseName": self.release_name
            }
        )
        logger.info(response)

        # If the graph does not exist, it cannot have the expected status
        graph = response["Item"]
        if graph is None:
          return False
        
        status = graph["currentState"]

        return status == expected_status

                  
    def update_endpoints(self, resource_name, resource_address):
        """
        Update graph with endpoints that get created by the application load balancer
        """
        self.table.update_item(
            Key={
                "releaseName": self.release_name
            },
            UpdateExpression = "SET endpoints.#resourceName = :resourceAddress",
            ExpressionAttributeNames = { 
                "#resourceName" : resource_name 
                },
            ExpressionAttributeValues = {
                ":resourceAddress": resource_address
            },
            ConditionExpression = "attribute_not_exists(endpoints.#resourceName)"
        )


    def update_status(self, status):
        """
        Updates the status of a Graph
        """
        self.table.update_item(
            Key={
                "releaseName": self.release_name
            },
            UpdateExpression="SET currentState = :state",
            ExpressionAttributeValues={
                ":state": status
            }
        )

    def delete(self):
        """
        Deletes the graph from the Table
        """
        self.table.delete_item(
        Key={
            "releaseName": self.release_name
        }
    )
