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
import { Cluster, KubernetesVersion } from "@aws-cdk/aws-eks";
import { Queue } from "@aws-cdk/aws-sqs";
import { LayerVersion } from "@aws-cdk/aws-lambda";
import { LAMBDA_LAYER_ARN } from "../../lib/constants";
import { Worker } from "../../lib/workers/worker";
import { Table, AttributeType } from "@aws-cdk/aws-dynamodb";

function createWorker(stack: cdk.Stack, extraSGs?: string, handler = "testHandler", timeout = cdk.Duration.minutes(10), batchSize = 3): Worker {
    if (extraSGs !== undefined) {
        stack.node.setContext("extraIngressSecurityGroups", extraSGs);
    }
    const donorCluster = new Cluster(stack, "testCluster", { version: KubernetesVersion.V1_16 });
    const donorQueue = new Queue(stack, "testQueue");
    const table = new Table(stack, "test", {
        partitionKey: {name: "test", type: AttributeType.STRING}
    });
    const layer = LayerVersion.fromLayerVersionArn(stack, "testLayer", LAMBDA_LAYER_ARN);

    return new Worker(stack, "testWorker", {
        queue: donorQueue,
        cluster: donorCluster,
        kubectlLayer: layer,
        graphTable: table,
        handler: handler,
        timeout: timeout,
        batchSize: batchSize
    });
}

test("Should create a Lambda Function", () => {
    // Given
    const stack = new cdk.Stack();

    // When
    createWorker(stack);

    // Then
    expectCDK(stack).to(haveResource("AWS::Lambda::Function"));
});

test("Should use handler name in properties", () => {
    // Given
    const stack = new cdk.Stack();

    // When
    createWorker(stack, undefined, "MyHandlerTest");

    // Then
    expectCDK(stack).to(haveResource("AWS::Lambda::Function", {
        Handler: "MyHandlerTest"
    }));
});

test("Should use timeout supplied in properties", ()  => {
    // Given
    const stack = new cdk.Stack();

    // When
    createWorker(stack, undefined, undefined, cdk.Duration.minutes(5));

    // Then
    expectCDK(stack).to(haveResource("AWS::Lambda::Function", {
        Timeout: 300
    }));
});

test("Should use batchSize supplied in properties for SQS Queue", ()  => {
    // Given
    const stack = new cdk.Stack();

    // When
    createWorker(stack, undefined, undefined, undefined, 7);

    // Then
    expectCDK(stack).to(haveResource("AWS::Lambda::EventSourceMapping", {
        BatchSize: 7
    }));
});

test("Should not populate Environment with extra_security_groups when none supplied", () => {
    // Given
    const stack = new cdk.Stack();

    // When
    createWorker(stack); // second argument is security groups

    // Then
    expectLambdaEnvironmentContainsNoExtraSecurityGroups(stack);
});

test("Should not populate Environment with extra_security_groups when empty string supplied", () => {
    // Given
    const stack = new cdk.Stack();

    // When
    createWorker(stack, ""); // second argument is security groups

    // Then
    expectLambdaEnvironmentContainsNoExtraSecurityGroups(stack);
});

function expectLambdaEnvironmentContainsNoExtraSecurityGroups(stack: cdk.Stack) {
    expectCDK(stack).to(haveResourceLike("AWS::Lambda::Function", {
        Environment:  {
            "Variables": {
                "cluster_name": {
                    "Ref": "testClusterFF806018"
                },
                "graph_table_name": {
                    "Ref": "testAF53AC38"
                }
            }
        }
    }));
}

test("should allow lambda to consume messages from queue and describe cluster", () => {
    // Given
    const stack = new cdk.Stack();

    // When
    createWorker(stack);

    // Then
    expectCDK(stack).to(haveResourceLike("AWS::IAM::Policy", {
        "PolicyDocument": {
            "Statement": [
                {
                    "Action": [
                        "sqs:ReceiveMessage",
                        "sqs:ChangeMessageVisibility",
                        "sqs:GetQueueUrl",
                        "sqs:DeleteMessage",
                        "sqs:GetQueueAttributes"
                    ],
                    "Effect": "Allow",
                    "Resource": {
                        "Fn::GetAtt": [
                            "testQueue601B0FCD",
                            "Arn"
                        ]
                    }
                },
                {
                    "Action": "eks:DescribeCluster",
                    "Effect": "Allow",
                    "Resource": {
                        "Fn::GetAtt": [
                            "testClusterFF806018",
                            "Arn"
                        ]
                    }
                }
            ]
        }
    }));
});


