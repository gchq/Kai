import boto3
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class TableItem:
    """
    Represents an item in a DynamoDB table keyed on the value "index_key" and having status defined by the "currentState" property
    """
    def __init__(self, table_name, index_key):
        dynamodb = boto3.resource("dynamodb")
        self.table = dynamodb.Table(table_name)
        self.index_key = index_key

    def check_status(self, expected_status):
        """
        Checks whether the item in the table has an expected status
        """
        response = self.table.get_item(
            Key=self.index_key
        )
        logger.info(response)

        # If the item does not exist, it cannot have the expected status
        item = response["Item"]
        if item is None:
          return False
        
        status = item["currentState"]

        return status == expected_status

    def update_status(self, status):
        """
        Updates the status of the item
        """
        self.table.update_item(
            Key=self.index_key,
            UpdateExpression="SET currentState = :state",
            ExpressionAttributeValues={
                ":state": status
            }
        )

    def delete(self):
        """
        Deletes the item from the Table
        """
        self.table.delete_item(
            Key=self.index_key
        )
