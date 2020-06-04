import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as rest from '../../lib/rest-api/kai-rest-api'
import { Cluster } from '@aws-cdk/aws-eks';

test("should create new new REST API", () => {
    // Given
    const stack = new cdk.Stack();
    const testCluster = new Cluster(stack, "testCluster");

    // When
    new rest.KaiRestApi(stack, "Test", { cluster: testCluster });

    // Then
    expectCDK(stack).to(haveResource("AWS::ApiGateway::RestApi"));
});

test("The Rest API should have a graph resource which runs a lambda function on POST request", () => {

});

test("Should create workers to add graphs to the eks cluster", () => {

});

test("workers should have name of eks cluster injected via environment variable", () => {

});

test("should create a queue for messages to be sent to workers", () => {

});
