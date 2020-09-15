/*
 * Copyright 2020 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @group unit
 */

import { expect as expectCDK, haveResource, haveResourceLike, countResourcesLike } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as api from "@aws-cdk/aws-apigateway";
import * as rest from "../../lib/rest-api/kai-rest-api";
import { Table, AttributeType } from "@aws-cdk/aws-dynamodb";
import { ADD_GRAPH_TIMEOUT, DELETE_GRAPH_TIMEOUT } from "../../lib/constants";

function createRestAPI(stack: cdk.Stack, id = "Test"): rest.KaiRestApi {
    const table = new Table(stack, "test", {
        partitionKey: {name: "testKey", type: AttributeType.STRING}
    });

    const namespaceTable = new Table(stack, "testNamespaceTable", {
        partitionKey: {name: "testNamespaceKey", type: AttributeType.STRING}
    });

    return new rest.KaiRestApi(stack, id, {
        "clusterName": "clusterName",
        "graphTable": table,
        "namespaceTable": namespaceTable,
        "userPoolArn": "userPoolArn",
        "userPoolId": "userPoolId"
    });
}

describe("REST API Creation", () => {

    test("should create new REST API", () => {
        // Given
        const stack = new cdk.Stack();

        // When
        createRestAPI(stack);

        // Then
        expectCDK(stack).to(haveResource("AWS::ApiGateway::RestApi"));
    });

    test("The REST API's name should be derived from the parent construct's id", () => {
        // Given
        const stack = new cdk.Stack();

        // When
        createRestAPI(stack, "NameTest");

        // Then
        expectCDK(stack).to(haveResource("AWS::ApiGateway::RestApi", {
            Name: "NameTestRestApi"
        }));
    });
});

describe("/graphs resource", () => {

    describe("/graphs endpoint contains expected resources", () => {

        test("The Rest API should have a graphs resource which can be POSTed to", () => {
            expectStackContainsResource("POST", "graphs", "TestTestRestApigraphs6F3DCBD4");
        });

        test("The Graph resource should handle GET requests on it's root", () => {
            expectStackContainsResource("GET", "graphs", "TestTestRestApigraphs6F3DCBD4");
        });

        test("The specific Graph resource should handle GET requests", () => {
            expectStackContainsResource("GET", "graphs", "TestTestRestApigraphsgraphNameB9AC8DA7");
        });

        test("The specific Graph resource should handle DELETE requests", () => {
            expectStackContainsResource("DELETE", "graphs", "TestTestRestApigraphsgraphNameB9AC8DA7");
        });
    });

    describe("stack contains expected graphs lambda functions", () => {

        test("Should create a lambda function to serve GET graph requests", () => {
            expectStackContainsLambda("get_graph_request.handler");
        });

        test("Should create a lambda function to serve POST graph requests", () => {
            expectStackContainsLambda("add_graph_request.handler");
        });

        test("Should create a lambda function to serve DELETE graph requests", () => {
            expectStackContainsLambda("delete_graph_request.handler");
        });
    });

    describe("stack contains expected queues", () => {

        test("should create a queue for DeleteGraph messages to be sent to workers", () => {
            expectStackContainsQueueWithTimeout(DELETE_GRAPH_TIMEOUT.toSeconds());
        });

        test("should create a queue for AddGraph messages to be sent to workers", () => {
            expectStackContainsQueueWithTimeout(ADD_GRAPH_TIMEOUT.toSeconds());
        });
    });

    describe("stack contains expected lambda function policy statements", () => {

        test("Should allow GetGraphsLambda to read from backend database", () => {
            expectLambdaContainsPolicyStatements(
                [
                    readDatabasePolicyStatementFor("testAF53AC38")
                ],
                "TestGetGraphsHandlerServiceRoleDefaultPolicy233C6E93",
                "TestGetGraphsHandlerServiceRole2564883C"
            );
        });

        test("Should allow AddGraphsLambda to list Cognito User pool, read write to backend database and send messages to add graph worker queue", () => {
            expectLambdaContainsPolicyStatements(
                [
                    listCognitoIdpUsersPolicyStatement,
                    readWriteDatabasePolicyStatementFor("testAF53AC38"),
                    sendMessagesPolicyStatementFor("TestAddGraphQueue2C2BD89D")
                ],
                "TestAddGraphHandlerServiceRoleDefaultPolicyA73C8E7F",
                "TestAddGraphHandlerServiceRole6EB73DAD"
            );
        });

        test("Should allow DeleteGraphsLambda to read write to backend database and send messages to delete graph worker queue", () => {
            expectLambdaContainsPolicyStatements(
                [
                    readWriteDatabasePolicyStatementFor("testAF53AC38"),
                    sendMessagesPolicyStatementFor("TestDeleteGraphQueue040902EA")
                ],
                "TestDeleteGraphHandlerServiceRoleDefaultPolicyF464B975",
                "TestDeleteGraphHandlerServiceRole22483873"
            );
        });
    });
});


describe("/namespaces resource", () => {

    describe("/namespaces endpoint contains expected resources", () => {

        test("The Rest API should have a namespaces resource which can be POSTed to", () => {
            expectStackContainsResource("POST", "namespaces", "TestTestRestApinamespaces31F7A7B3");
        });

        test("The Namespace resource should handle GET requests on it's root", () => {
            expectStackContainsResource("GET", "graphs", "TestTestRestApinamespaces31F7A7B3");
        });

        test("The specific Namespace resource should handle GET requests", () => {
            expectStackContainsResource("GET", "namespaces", "TestTestRestApinamespacesnamespaceName79793E79");
        });

        test("The specific Namespace resource should handle POST requests", () => {
            expectStackContainsResource("POST", "namespaces", "TestTestRestApinamespacesnamespaceName79793E79");
        });

        test("The specific Namespace resource should handle DELETE requests", () => {
            expectStackContainsResource("DELETE", "namespaces", "TestTestRestApinamespacesnamespaceName79793E79");
        });
    });

    describe("stack contains expected namespaces lambda functions", () => {

        test("Should create a lambda function to serve GET namespace requests", () => {
            expectStackContainsLambda("get_namespace_request.handler");
        });

        test("Should create a lambda function to serve POST namespace requests", () => {
            expectStackContainsLambda("add_namespace_request.handler");
            expectStackContainsLambda("update_namespace_request.handler");
        });

        test("Should create a lambda function to serve DELETE namespace requests", () => {
            expectStackContainsLambda("delete_namespace_request.handler");
        });
    });

    describe("stack contains expected lambda function policy statements", () => {

        test("Should allow GetNamespaceLambda to read from backend database", () => {
            expectLambdaContainsPolicyStatements(
                [
                    readDatabasePolicyStatementFor("testNamespaceTable774FC83E")
                ],
                "TestGetNamespacesHandlerServiceRoleDefaultPolicyF20D0FFE",
                "TestGetNamespacesHandlerServiceRole466B809A"
            );
        });

        test("Should allow AddNamespaceLambda to list Cognito user pool and read and write to backend database", () => {
            expectLambdaContainsPolicyStatements(
                [
                    listCognitoIdpUsersPolicyStatement,
                    readWriteDatabasePolicyStatementFor("testNamespaceTable774FC83E")
                ],
                "TestAddNamespaceHandlerServiceRoleDefaultPolicy9BE6DA76",
                "TestAddNamespaceHandlerServiceRoleCEA1F08E"
            );
        });

        test("Should allow UpdateNamespaceLambda to list Cognito user pool and read and write to backend database", () => {
            expectLambdaContainsPolicyStatements(
                [
                    listCognitoIdpUsersPolicyStatement,
                    readWriteDatabasePolicyStatementFor("testNamespaceTable774FC83E")
                ],
                "TestUpdateNamespaceHandlerServiceRoleDefaultPolicyE3559E88",
                "TestUpdateNamespaceHandlerServiceRole89EA6CC5"
            );
        });

        test("Should allow DeleteNamespaceLambda to read and write to backend database", () => {
            expectLambdaContainsPolicyStatements(
                [
                    readWriteDatabasePolicyStatementFor("testNamespaceTable774FC83E")
                ],
                "TestDeleteNamespaceHandlerServiceRoleDefaultPolicy8CAEB25A",
                "TestDeleteNamespaceHandlerServiceRoleAABA8A00"
            );
        });
    });
});


describe("Resource access controls", () => {

    test("All Rest API Methods should be configured with the KaiRestAuthorizer", () => {
        // Given
        const stack = new cdk.Stack();

        // When
        createRestAPI(stack);

        // Then
        const apiGatewayMethodCount = stack.node.findAll().filter(isApiGatewayMethod).length;

        expectCDK(stack).to(countResourcesLike("AWS::ApiGateway::Method", apiGatewayMethodCount, {
            AuthorizationType: "COGNITO_USER_POOLS",
            AuthorizerId: {
                Ref: "TestKaiRestApiAuthorizerB0CFBC9B"
            }
        }));
    });
});


function expectStackContainsResource(method: string, path: string, resourceId: string): void {
    // Given
    const stack = new cdk.Stack();

    // When
    createRestAPI(stack);

    // Then
    expectCDK(stack).to(haveResource("AWS::ApiGateway::Resource", {
        PathPart: path
    }));

    expectCDK(stack).to(haveResourceLike("AWS::ApiGateway::Method", {
        HttpMethod: method,
        ResourceId: {
            Ref: resourceId
        },
        RestApiId: {
            Ref: "TestTestRestApiF3AB3CBC"
        }
    }));
}


function expectStackContainsLambda(lambdaHandler: string): void {
    // Given
    const stack = new cdk.Stack();

    // When
    createRestAPI(stack);

    // Then
    expectCDK(stack).to(haveResource("AWS::Lambda::Function", {
        Handler: lambdaHandler
    }));
}


function expectLambdaContainsPolicyStatements(statements: Record<string, unknown>[], policyName: string, roleRef: string): void {
    // Given
    const stack = new cdk.Stack();

    // When
    createRestAPI(stack);

    // Then
    expectCDK(stack).to(haveResource("AWS::IAM::Policy", {
        "PolicyDocument": {
            "Statement": statements,
            "Version": "2012-10-17"
        },
        "PolicyName": policyName,
        "Roles": [
            {
                "Ref": roleRef
            }
        ]
    }));
}


function expectStackContainsQueueWithTimeout(timeout: number): void {
    // Given
    const stack = new cdk.Stack();

    // When
    createRestAPI(stack);

    // Then
    expectCDK(stack).to(haveResource("AWS::SQS::Queue", {
        VisibilityTimeout: timeout
    }));
}


function readDatabasePolicyStatementFor(table: string): Record<string, unknown> {
    return {
        "Action": [
            "dynamodb:BatchGetItem",
            "dynamodb:GetRecords",
            "dynamodb:GetShardIterator",
            "dynamodb:Query",
            "dynamodb:GetItem",
            "dynamodb:Scan"
        ],
        "Effect": "Allow",
        "Resource": [
            {
                "Fn::GetAtt": [
                    table,
                    "Arn"
                ]
            },
            {
                "Ref": "AWS::NoValue"
            }
        ]
    };
}


function readWriteDatabasePolicyStatementFor(table: string): Record<string, unknown> {
    return {
        "Action": [
            "dynamodb:BatchGetItem",
            "dynamodb:GetRecords",
            "dynamodb:GetShardIterator",
            "dynamodb:Query",
            "dynamodb:GetItem",
            "dynamodb:Scan",
            "dynamodb:BatchWriteItem",
            "dynamodb:PutItem",
            "dynamodb:UpdateItem",
            "dynamodb:DeleteItem"
        ],
        "Effect": "Allow",
        "Resource": [
            {
                "Fn::GetAtt": [
                    table,
                    "Arn"
                ]
            },
            {
                "Ref": "AWS::NoValue"
            }
        ]
    };
}


function sendMessagesPolicyStatementFor(queue: string): Record<string, unknown> {
    return {
        "Action": [
            "sqs:SendMessage",
            "sqs:GetQueueAttributes",
            "sqs:GetQueueUrl"
        ],
        "Effect": "Allow",
        "Resource": {
            "Fn::GetAtt": [
                queue,
                "Arn"
            ]
        }
    };
}


const listCognitoIdpUsersPolicyStatement = {
    "Action": "cognito-idp:ListUsers",
    "Effect": "Allow",
    "Resource": "userPoolArn"
};


function isApiGatewayMethod(construct: cdk.IConstruct): boolean {
    return (construct instanceof api.Method);
}
