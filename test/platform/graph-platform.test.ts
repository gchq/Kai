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

import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as platform from "../../lib/platform/graph-platform";

test("EKS cluster is created", () => {
    // Given
    const stack = new cdk.Stack();

    // When
    new platform.GraphPlatForm(stack, "TestPlatform");

    // Then
    expectCDK(stack).to(haveResource("Custom::AWSCDK-EKS-Cluster"));
});

test("Node group is created", () => {
    // Given
    const stack = new cdk.Stack();

    // When
    new platform.GraphPlatForm(stack, "TestPlatform");

    // Then
    expectCDK(stack).to(haveResource("AWS::EKS::Nodegroup", {
        InstanceTypes: [ 
            "t3.medium"
        ],
        ScalingConfig: {
            "DesiredSize": 2,
            "MaxSize": 10,
            "MinSize": 1
        }
    }));
});

test("Node group is created with a desired instance type", () => {
    // Given
    const stack = new cdk.Stack();
    stack.node.setContext("clusterNodegroup", { "instanceType": "m5.large" });

    // When
    new platform.GraphPlatForm(stack, "TestPlatform");

    // Then
    expectCDK(stack).to(haveResource("AWS::EKS::Nodegroup", {
        InstanceTypes: [ 
            "m5.large"
        ]
    }));
});

test("Node group is created with a desired sizes", () => {
    // Given
    const stack = new cdk.Stack();
    stack.node.setContext("clusterNodegroup", { "desiredSize": 5, "minSize": 3, "maxSize": 100 });

    // When
    new platform.GraphPlatForm(stack, "TestPlatform");

    // Then
    expectCDK(stack).to(haveResource("AWS::EKS::Nodegroup", {
        ScalingConfig: {
            DesiredSize: 5,
            MinSize: 3,
            MaxSize: 100
        }
    }));
});

test("Node group is created when config is string", () => {
    // Given
    const stack = new cdk.Stack();
    stack.node.setContext("clusterNodegroup", "{ \"desiredSize\": 4, \"minSize\": 2, \"maxSize\": 30, \"instanceType\": \"m5.large\" }");

    // When
    new platform.GraphPlatForm(stack, "TestPlatform");

    // Then
    expectCDK(stack).to(haveResource("AWS::EKS::Nodegroup", {
        InstanceTypes: [ 
            "m5.large"
        ],
        ScalingConfig: {
            DesiredSize: 4,
            MinSize: 2,
            MaxSize: 30
        }
    }));
});

test("Should throw error when cluster config is the wrong type", () => {
    // Given
    const stack = new cdk.Stack();
    // When 
    stack.node.setContext("clusterNodegroup", { "desiredSize": "5" });

    // Then
    expect(() => { new platform.GraphPlatForm(stack, "TestPlatform");} ).toThrowError();
});

test("Should merge any configuration specified with the default configuration", () => {
    // Given
    const stack = new cdk.Stack();
    stack.node.setContext("clusterNodegroup", { "desiredSize": 5, "minSize": 3 });

    // When
    new platform.GraphPlatForm(stack, "TestPlatform");

    // Then
    expectCDK(stack).to(haveResource("AWS::EKS::Nodegroup", {
        InstanceTypes: [
            "t3.medium"
        ],
        ScalingConfig: {
            DesiredSize: 5,
            MinSize: 3,
            MaxSize: 10
        }
    }));
});

test("The ALB ingress controller is deployed on the kube-system namespace", () => {
    // Given
    const stack = new cdk.Stack();

    // When
    new platform.GraphPlatForm(stack, "TestPlatform");

    // Then
    expectCDK(stack).to(haveResource("Custom::AWSCDK-EKS-HelmChart", {
        "Chart": "aws-alb-ingress-controller",
        "Namespace": "kube-system",
        "Repository": "http://storage.googleapis.com/kubernetes-charts-incubator"
    }));
});
