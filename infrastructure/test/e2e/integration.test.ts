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
 * @group e2e
 */

import { ClusterHelper } from "./setup/cluster-helper";
import { SchemaBuilder } from "./config/schema-builder";
import { IResponse, RestApiClient } from "./client/rest-api-client";
import schemaObject from "./config/schema.json";

const clusterHelper: ClusterHelper = new ClusterHelper();
const clusterSetupTimeoutMilliseconds: number = 30 * 60 * 1000;
const graphDeploymentTimeoutMilliseconds: number = 10 * 60 * 1000;
const minuteMilliseconds: number = 60 * 1000;
const user1 = "user1";
const user2 = "user2";
const user3 = "user3";
const testGraph1 = "testGraph1";
const testGraph2 = "testGraph2";

let client: RestApiClient;

beforeAll(
    async() => {
        await clusterHelper.deployCluster([ user1, user2, user3 ]);
        client = new RestApiClient(clusterHelper.restApiEndpoint, clusterHelper.userTokens);
    },
    clusterSetupTimeoutMilliseconds
);


test("GET /graphs returns success and an empty array when there are no graphs deployed.", async() => {
    const response: IResponse = await client.getGraphs(user1);
    expect(response.status).toBe(200);
    expect(response.data).toEqual([]);
});


test("POST /graphs successfully deploys a graph", async() => {
    const schema: Record<string, unknown> = SchemaBuilder.createSchema({
        graphName: testGraph1,
        administrators: [ clusterHelper.userTokens[user3].user.userName ],
        schema: schemaObject
    });
    const response: IResponse = await client.createGraph(user1, schema);
    expect(response.status).toBe(201);
    expect(response.data).toEqual("");
    expect(await client.awaitGraphDeployment(user1, testGraph1, graphDeploymentTimeoutMilliseconds)).toBe(true);
}, (graphDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));


test("GET /graphs returns success and an empty array when user does not have permission to view any deployed graphs .", async() => {
    const response: IResponse = await client.getGraphs(user2);
    expect(response.status).toBe(200);
    expect(response.data).toEqual([]);
});


test("GET /graphs returns success and an array containing the graphs visible to the creating user.", async() => {
    const response: IResponse = await client.getGraphs(user1);
    expect(response.status).toBe(200);
    expect(response.data).toHaveLength(1);
    expect(response.data[0]).toMatchObject({
        graphName: testGraph1,
        administrators: [
            clusterHelper.userTokens[user1].user.userName,
            clusterHelper.userTokens[user3].user.userName
        ],
        currentState: "DEPLOYED",
        releaseName: testGraph1.toLowerCase()
    });
});


test("GET /graphs returns success and an array containing the graphs visible to users declared as administrator.", async() => {
    const response: IResponse = await client.getGraphs(user3);
    expect(response.status).toBe(200);
    expect(response.data).toHaveLength(1);
    expect(response.data[0]).toMatchObject({
        graphName: testGraph1,
        administrators: [
            clusterHelper.userTokens[user1].user.userName,
            clusterHelper.userTokens[user3].user.userName
        ],
        currentState: "DEPLOYED",
        releaseName: testGraph1.toLowerCase()
    });
});


test("POST /graphs returns a 400 error when the graphName contains non alphanumeric characters", async() => {
    const schema: Record<string, unknown> = SchemaBuilder.createSchema({
        graphName: "non-alphanumeric_graphName",
        schema: schemaObject
    });
    const response: IResponse = await client.createGraph(user1, schema);
    expect(response.status).toBe(400);
    expect(response.data).toEqual("graphName is a required field which must made up of alphanumeric characters");
});


test("POST /graphs returns a 400 error when the lower case graphName already exists", async() => {
    const schema: Record<string, unknown> = SchemaBuilder.createSchema({
        graphName: testGraph1.toUpperCase(),
        schema: schemaObject
    });
    const response: IResponse = await client.createGraph(user1, schema);
    expect(response.status).toBe(400);
    expect(response.data).toMatch("Graph release name " + testGraph1.toLowerCase() + " already exists");
});


test("POST /graphs returns a 400 error when no schema is supplied", async() => {
    const schema: Record<string, unknown> = SchemaBuilder.createSchema({
        graphName: testGraph2
    });
    const response: IResponse = await client.createGraph(user1, schema);
    expect(response.status).toBe(400);
    expect(response.data).toEqual("schema is a required field");
});


test("POST /graphs returns a 400 error when attempting to configure administrators not registered in the Cognito UserPool", async() => {
    const schema: Record<string, unknown> = SchemaBuilder.createSchema({
        graphName: testGraph2,
        administrators: [ "InvalidCognitoUser" ],
        schema: schemaObject
    });
    const response: IResponse = await client.createGraph(user1, schema);
    expect(response.status).toBe(400);
    expect(response.data).toMatch("Not all of the supplied administrators are valid Cognito users:");
});


afterAll(async() => {
    //await clusterHelper.destroyCluster();
});
