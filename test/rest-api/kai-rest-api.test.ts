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

import { expect as expectCDK, haveResource, haveResourceLike } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as rest from "../../lib/rest-api/kai-rest-api";
import { Table, AttributeType } from "@aws-cdk/aws-dynamodb";
import { ADD_GRAPH_TIMEOUT } from "../../lib/constants";

function createRestAPI(stack: cdk.Stack, id = "Test"): rest.KaiRestApi {
    const table = new Table(stack, "test", {
        partitionKey: {name: "testKey", type: AttributeType.STRING}
    });

    return new rest.KaiRestApi(stack, id, {
        "graphTable": table
    });
}

test("should create new REST API", () => {
    // Given
    const stack = new cdk.Stack();

    // When
    createRestAPI(stack)

    // Then
    expectCDK(stack).to(haveResource("AWS::ApiGateway::RestApi"));
});

test("The REST API's name should be derived from the parent construct's id", () => {
    // Given
    const stack = new cdk.Stack();
    
    // When
    createRestAPI(stack, "NameTest")

    // Then
    expectCDK(stack).to(haveResource("AWS::ApiGateway::RestApi", {
        Name: "NameTestRestApi"
    }));
});

test("The Rest API should have a graph resource which can be POSTed to", () => {
    // Given
    const stack = new cdk.Stack();
    
    // When
    createRestAPI(stack);
 
    // Then
    expectCDK(stack).to(haveResource("AWS::ApiGateway::Resource", {
        PathPart: "graphs"
    }));

    expectCDK(stack).to(haveResourceLike("AWS::ApiGateway::Method", {
        HttpMethod: "POST",
        ResourceId: {
            Ref: "TestTestRestApigraphs6F3DCBD4"
        },
        RestApiId: {
            Ref: "TestTestRestApiF3AB3CBC"
        }
    }));
});

test("The Graph resource should handle GET requests on it's root", () => {
     // Given
     const stack = new cdk.Stack();
     
     // When
     createRestAPI(stack);

     // Then
     expectCDK(stack).to(haveResourceLike("AWS::ApiGateway::Method", {
        HttpMethod: "GET",
        ResourceId: {
            Ref: "TestTestRestApigraphs6F3DCBD4"
        },
        RestApiId: {
            Ref: "TestTestRestApiF3AB3CBC"
        }
    }));
});

test("The REST API should have a resource which can GET specific grapphs", () => {
    // Given
    const stack = new cdk.Stack();
   
    // When
    createRestAPI(stack);
 
    // Then
    expectCDK(stack).to(haveResource("AWS::ApiGateway::Resource", {
        PathPart: "{graphId}",
        ParentId: {
            "Ref": "TestTestRestApigraphs6F3DCBD4"
        }
    }));

    expectCDK(stack).to(haveResourceLike("AWS::ApiGateway::Method", {
        HttpMethod: "GET",
        ResourceId: {
            Ref: "TestTestRestApigraphsgraphId0A18A4C6"
        },
        RestApiId: {
            Ref: "TestTestRestApiF3AB3CBC"
        }
    }));
});

test("The specific Graph resource should handle DELETE requests", () => {
    // Given
    const stack = new cdk.Stack();
     
    // When
    createRestAPI(stack);

    // Then
    expectCDK(stack).to(haveResourceLike("AWS::ApiGateway::Method", {
        HttpMethod: "DELETE",
        ResourceId: {
            Ref: "TestTestRestApigraphsgraphId0A18A4C6"
        },
        RestApiId: {
            Ref: "TestTestRestApiF3AB3CBC"
        }
    }));
});

// todo tests for the DELETE graph queues + lambdas
// todo tests for the Dynamo database

test("should create a queue for AddGraph messages to be sent to workers", () => {
    // Given
    const stack = new cdk.Stack();
    const table = new Table(stack, "test", {
        partitionKey: {name: "test", type: AttributeType.STRING}
    });

    // When
    new rest.KaiRestApi(stack, "Test", {
        "graphTable": table
    });

    // Then
    expectCDK(stack).to(haveResource("AWS::SQS::Queue", {
        VisibilityTimeout: ADD_GRAPH_TIMEOUT.toSeconds()
    }));
});

test("should create lambda to write messages to the Queue", () => {
    // Given
    const stack = new cdk.Stack();
    const table = new Table(stack, "test", {
        partitionKey: {name: "test", type: AttributeType.STRING}
    });

    // When
    new rest.KaiRestApi(stack, "Test", {
        "graphTable": table
    });

    // Then
    expectCDK(stack).to(haveResource("AWS::Lambda::Function", {
        Handler: "add_graph_request.handler"
    }));
});

test("should allow AddGraphLambda to write messages to queue and write to Dynamodb", () => {
    // Given
    const stack = new cdk.Stack();
    const table = new Table(stack, "test", {
        partitionKey: {name: "test", type: AttributeType.STRING}
    });

    // When
    new rest.KaiRestApi(stack, "Test", {
        "graphTable": table
    });

    // Then
    expectCDK(stack).to(haveResource("AWS::IAM::Policy", {
        "PolicyDocument": {
            "Statement": [
                {
                    "Action": [
                        "dynamodb:BatchWriteItem",
                        "dynamodb:PutItem",
                        "dynamodb:UpdateItem",
                        "dynamodb:DeleteItem"
                    ],
                    "Effect": "Allow",
                    "Resource": [
                        {
                            "Fn::GetAtt": [
                                "testAF53AC38",
                                "Arn"
                            ]
                        },
                        {
                            "Ref": "AWS::NoValue"
                        }
                    ]
                },
                {
                    "Action": [
                        "sqs:SendMessage",
                        "sqs:GetQueueAttributes",
                        "sqs:GetQueueUrl"
                    ],
                    "Effect": "Allow",
                    "Resource": {
                        "Fn::GetAtt": [
                            "TestAddGraphQueue2C2BD89D",
                            "Arn"
                        ]
                    }
                }
            ],
            "Version": "2012-10-17"
        },
        "PolicyName": "TestAddGraphHandlerServiceRoleDefaultPolicyA73C8E7F",
        "Roles": [
            {
                "Ref": "TestAddGraphHandlerServiceRole6EB73DAD"
            }
        ] 
    }));
});
