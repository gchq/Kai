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

import { Stack } from "@aws-cdk/core";
import { Database } from "../../lib/database/database";
import { countResourcesLike, expect as expectCDK, haveResource, haveResourceLike } from "@aws-cdk/assert";

function createDB(stack: Stack, graphTableMinCapacity = 1, graphTableMaxCapacity = 25, graphTableTargetUtilization = 80, namespaceTableMinCapacity = 1, namespaceTableMaxCapacity = 10, namespaceTableTargetUtilization = 50) {
    return new Database(stack, "TestDB", {
        graphTableScalingProps: {
            maxCapacity: graphTableMaxCapacity,
            minCapacity: graphTableMinCapacity,
            targetUtilizationPercent: graphTableTargetUtilization
        },
        namespaceTableScalingProps: {
            maxCapacity: namespaceTableMaxCapacity,
            minCapacity: namespaceTableMinCapacity,
            targetUtilizationPercent: namespaceTableTargetUtilization
        }
    });
}

test("should create a database containing 2 tables", () => {
    // Given
    const stack = new Stack();

    // When
    createDB(stack);

    // Then
    expectCDK(stack).to(countResourcesLike("AWS::DynamoDB::Table", 2, {}));
});

test("should use the releaseName as primary key and namespace name as sort key for the graph table", () => {
    // Given
    const stack = new Stack();

    // When
    createDB(stack);

    // Then
    expectCDK(stack).to(haveResource("AWS::DynamoDB::Table", {
        "KeySchema": [
            {
                "AttributeName": "releaseName",
                "KeyType": "HASH"
            },
            {
                "AttributeName": "namespaceName",
                "KeyType": "RANGE"
            }
        ],
        "AttributeDefinitions": [
            {
                "AttributeName": "releaseName",
                "AttributeType": "S"
            },
            {
                "AttributeName": "namespaceName",
                "AttributeType": "S"
            }
        ]
    }));
});

test("should use the namespaceName as a primary key for the namespace table", () => {
    // Given
    const stack = new Stack();

    // When
    createDB(stack);

    // Then
    expectCDK(stack).to(haveResource("AWS::DynamoDB::Table", {
        "KeySchema": [
            {
                "AttributeName": "namespaceName",
                "KeyType": "HASH"
            }
        ],
        "AttributeDefinitions": [
            {
                "AttributeName": "namespaceName",
                "AttributeType": "S"
            }
        ]
    }));
});

test("should be able to pass in the autoscaling properties", () => {
    // Given
    const stack = new Stack();

    // When
    createDB(stack, 3, 300, 50, 6, 600, 60);

    // Then
    expectScalingMinAndMaxSettings(stack, 3, 300, "TestDBGraphDynamoTable31F34179");
    expectScalingPolicySettings(stack, 50, "TestDBGraphDynamoTableReadScalingTargetTrackingC37072E9");

    expectScalingMinAndMaxSettings(stack, 6, 600, "TestDBNamespaceDynamoTableCA36710A");
    expectScalingPolicySettings(stack, 60, "TestDBNamespaceDynamoTableReadScalingTargetTracking61132725");
});

function expectScalingMinAndMaxSettings(stack: Stack, min: number, max: number, tableRef: string): void {
    expectCDK(stack).to(haveResource("AWS::ApplicationAutoScaling::ScalableTarget", {
        MaxCapacity: max,
        MinCapacity: min,
        "ResourceId": {
            "Fn::Join": [
                "",
                [
                    "table/",
                    {
                        "Ref": tableRef
                    }
                ]
            ]
        }
    }));
}

function expectScalingPolicySettings(stack: Stack, utilizationPercent: number, policyName: string): void {
    expectCDK(stack).to(haveResourceLike("AWS::ApplicationAutoScaling::ScalingPolicy", {
        "PolicyName": policyName,
        "TargetTrackingScalingPolicyConfiguration": {
            "PredefinedMetricSpecification": {
                "PredefinedMetricType": "DynamoDBReadCapacityUtilization"
            },
            "TargetValue": utilizationPercent
        }
    }));
}
