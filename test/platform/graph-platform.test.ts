import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as platform from '../../lib/platform/graph-platform';

test('EKS cluster is created', () => {
    // Given
    const stack = new cdk.Stack();

    // When
    const graphPlatform = new platform.GraphPlatForm(stack, 'TestPlatform');

    // Then
    expectCDK(stack).to(haveResource("Custom::AWSCDK-EKS-Cluster"))
});

test('Masters role is created', () => {

});

test('Node group is created', () => {

});

test('A service role is created', () => {

})

test('The ALB ingress controller is deployed on the kube-system namespace', () => {
    // Given
    const stack = new cdk.Stack();

    // When
    const graphPlatform = new platform.GraphPlatForm(stack, 'TestPlatform');

    // Then
    expectCDK(stack).to(haveResource('Custom::AWSCDK-EKS-HelmChart', {
        'Chart': 'aws-alb-ingress-controller',
        'Namespace': 'kube-system',
        'Repository': 'http://storage.googleapis.com/kubernetes-charts-incubator'
    }));
});

test('The ingress controller uses the service role created', () => {

});
