import { SynthUtils } from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import cdk = require('@aws-cdk/core');
import { GraphService } from '../lib/graph-service';

test('GraphService matches the snapshot', () => {
    // Given
    const stack = new cdk.Stack();
    // When
    new GraphService(stack, "GraphService");
    // Then
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('GraphService should have a GetAll endpoint', () => {
    // Given
    const stack = new cdk.Stack();
    // When
    new GraphService(stack, "GraphService");
    // Then
    expect(stack).toHaveResource("AWS::Lambda::Function", {
        Handler: "graphs.getAll"
    });
});

test('GraphService should have a Delete endpoint', () => {
    // Given
    const stack = new cdk.Stack();
    // When
    new GraphService(stack, "GraphService");
    // Then
    expect(stack).toHaveResource("AWS::Lambda::Function", {
        Handler: "graphs.delete"
    });
});

test('GraphService should have an Add endpoint', () => {
    // Given
    const stack = new cdk.Stack();
    // When
    new GraphService(stack, "GraphService");
    // Then
    expect(stack).toHaveResource("AWS::Lambda::Function", {
        Handler: "graphs.add"
    });
});
