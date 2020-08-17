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
import { GraphDatabase } from "../../lib/database/graph-database";
import { expect as expectCDK, haveResource } from "@aws-cdk/assert";

function createDB(stack: Stack, minCapacity = 1, maxCapacity=25, targetUtilization = 80) {
    return new GraphDatabase(stack, "TestDB", {
        maxCapacity: maxCapacity,
        minCapacity: minCapacity,
        targetUtilizationPercent: targetUtilization
    });
}

test("should create a database", () => {
    // Given
    const stack = new Stack();

    // When
    createDB(stack);

    // Then
    expectCDK(stack).to(haveResource("AWS::DynamoDB::Table"));
});

test("should use the graphId as a primary key", () => {
    // Given
    const stack = new Stack();

    // When
    createDB(stack);

    // Then
    expectCDK(stack).to(haveResource("AWS::DynamoDB::Table", {
        "KeySchema": [
            {
                "AttributeName": "graphId",
                "KeyType": "HASH"
            }
        ],
        "AttributeDefinitions": [
            {
                "AttributeName": "graphId",
                "AttributeType": "S"
            }
        ]
    }));
});

test("should be able to pass in the autoscaling properties", () => {
    // Given
    const stack = new Stack();

    // When
    createDB(stack, 3, 300, 50);

    // Then
    expectCDK(stack).to(haveResource("AWS::ApplicationAutoScaling::ScalableTarget", {
        MaxCapacity: 300,
        MinCapacity: 3
    }));

    expectCDK(stack).to(haveResource("AWS::ApplicationAutoScaling::ScalingPolicy", {
        "TargetTrackingScalingPolicyConfiguration": {
            "PredefinedMetricSpecification": {
                "PredefinedMetricType": "DynamoDBReadCapacityUtilization"
            },
            "TargetValue": 50
        }
    }));
});