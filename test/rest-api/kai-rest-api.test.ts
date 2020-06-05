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

test("should create new new REST API", () => {
    // Given
    const stack = new cdk.Stack();

    // When
    new rest.KaiRestApi(stack, "Test");

    // Then
    expectCDK(stack).to(haveResource("AWS::ApiGateway::RestApi", {
        Name: "KaiRestApi"
    }));
});

test("The Rest API should have a graph resource which can be POSTed to", () => {
     // Given
     const stack = new cdk.Stack();

     // When
     new rest.KaiRestApi(stack, "Test");
 
     // Then
     expectCDK(stack).to(haveResource("AWS::ApiGateway::Resource", {
         PathPart: "graphs"
     }));

     expectCDK(stack).to(haveResourceLike("AWS::ApiGateway::Method", {
         HttpMethod: "POST",
         ResourceId: {
             Ref: "TestKaiRestApigraphsD9CE785A"
         },
         RestApiId: {
             Ref: "TestKaiRestApi8B15993F"
         }
     }));
});

test("should create a queue for messages to be sent to workers", () => {
     // Given
     const stack = new cdk.Stack();

     // When
     new rest.KaiRestApi(stack, "Test");

     // Then
     expectCDK(stack).to(haveResource("AWS::SQS::Queue", {
         VisibilityTimeout: 600
     }));
});

test("should create lambda to write messages to the Queue", () => {
    // Given
    const stack = new cdk.Stack();

    // When
    new rest.KaiRestApi(stack, "Test");

    // Then
    expectCDK(stack).to(haveResource("AWS::Lambda::Function", {
        Handler: "add_graph_request.handler"
    }));
});

test("should allow Lambda to write messages to queue", () => {
    // Given
    const stack = new cdk.Stack();

    // When
    new rest.KaiRestApi(stack, "Test");

    // Then
    expectCDK(stack).to(haveResourceLike("AWS::IAM::Policy", {
        "PolicyDocument": {
            "Statement": [
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
            ]
          },
          "Roles": [
            {
              "Ref": "TestAddGraphHandlerServiceRole6EB73DAD"
            }
          ]
    }));
});
