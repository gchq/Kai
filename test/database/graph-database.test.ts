import { Stack } from "@aws-cdk/core";
import { GraphDatabase } from "../../lib/database/graph-database";
import { expect as expectCDK, haveResource, haveResourceLike } from "@aws-cdk/assert";

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
    }))
});