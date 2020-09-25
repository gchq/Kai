import boto3
import os


class User:

    def __init__(self):
        self.cognito_client = boto3.client('cognito-idp')
        self.user_pool_id = os.getenv("user_pool_id")

    def valid_cognito_users(self, users):
        response = self.cognito_client.list_users(UserPoolId=self.user_pool_id)
        cognito_users = map(self.to_user_name, response["Users"])
        return set(users).issubset(set(cognito_users))

    def to_user_name(self, user):
        return user["Username"]

    def contains_duplicates(self, items):
        return set([item for item in items if items.count(item) > 1])

    def get_requesting_cognito_user(self, request):
        if ("requestContext" not in request
            or "authorizer" not in request["requestContext"]
            or "claims" not in request["requestContext"]["authorizer"]
            or "cognito:username" not in request["requestContext"]["authorizer"]["claims"]):
            return None
        return request["requestContext"]["authorizer"]["claims"]["cognito:username"]
