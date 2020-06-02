import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as platform from '../../lib/platform/graph-platform-stack';

test('EKS cluster is created', () => {
    // Given
    const app = new cdk.App();

    // When
    const stack = new platform.GraphPlatFormStack(app, 'TestStack');

    // Then
    expectCDK(stack).to(haveResource("Custom::AWSCDK-EKS-Cluster"))
})