import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as platform from '../../lib/platform/graph-platform';

test('EKS cluster is created', () => {
    // Given
    const stack = new cdk.Stack();

    // When
    new platform.GraphPlatForm(stack, 'TestPlatform');

    // Then
    expectCDK(stack).to(haveResource("Custom::AWSCDK-EKS-Cluster"))
});

test('Node group is created', () => {
    // Given
    const stack = new cdk.Stack();

    // When
    new platform.GraphPlatForm(stack, 'TestPlatform');

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
    }))
});

test('The ALB ingress controller is deployed on the kube-system namespace', () => {
    // Given
    const stack = new cdk.Stack();

    // When
    new platform.GraphPlatForm(stack, 'TestPlatform');

    // Then
    expectCDK(stack).to(haveResource('Custom::AWSCDK-EKS-HelmChart', {
        'Chart': 'aws-alb-ingress-controller',
        'Namespace': 'kube-system',
        'Repository': 'http://storage.googleapis.com/kubernetes-charts-incubator'
    }));
});
