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
import { LoadBalancerHelper } from "./setup/load-balancer-helper";
import { VolumeHelper } from "./setup/volume-helper";
import { IResponse, RestApiClient } from "./client/rest-api-client";
import schemaObject from "./config/schema.json";

const clusterHelper: ClusterHelper = new ClusterHelper();
const clusterSetupTimeoutMilliseconds: number = 30 * 60 * 1000;
const graphDeploymentTimeoutMilliseconds: number = 10 * 60 * 1000;
const graphDeletionTimeoutMilliseconds: number = 10 * 60 * 1000;
const minuteMilliseconds: number = 60 * 1000;
const user1 = "user1";
const user2 = "user2";
const user3 = "user3";
const testGraph1 = "testGraph1";
const testGraph2 = "testGraph2";

let client: RestApiClient;
let loadBalancerHelper: LoadBalancerHelper;
let volumeHelper: VolumeHelper;

beforeAll(
    async() => {
        await clusterHelper.deployCluster([ user1, user2, user3 ]);
        client = new RestApiClient(clusterHelper.restApiEndpoint, clusterHelper.userTokens);
        loadBalancerHelper = new LoadBalancerHelper(clusterHelper.clusterName, clusterHelper.stackName);
        volumeHelper = new VolumeHelper(clusterHelper.clusterName, clusterHelper.stackName);
    },
    clusterSetupTimeoutMilliseconds
);

describe("Creating a graph", () => {

    test("GET /graphs returns success and an empty array when there are no graphs deployed.", async() => {
        const response: IResponse = await client.getGraphs(user1);
        expect(response.status).toBe(200);
        expect(response.data).toEqual([]);
    });


    test("POST /graphs successfully deploys a graph", async() => {
        const schema: Record<string, unknown> = {
            "graphName": testGraph1,
            "administrators": [ clusterHelper.userTokens[user3].user.userName ],
            "schema": schemaObject
        };
        const response: IResponse = await client.createGraph(user1, schema);
        expect(response.status).toBe(201);
        expect(response.data).toEqual("");
        expect(await client.awaitGraphDeployment(user1, testGraph1, graphDeploymentTimeoutMilliseconds)).toBe(true);
    }, (graphDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

});

describe("GET /graphs tests", () => {

    test("GET /graphs returns 200 success and an empty array when user does not have permission to view any deployed graphs.", async() => {
        const response: IResponse = await client.getGraphs(user2);
        expect(response.status).toBe(200);
        expect(response.data).toEqual([]);
    });


    test("GET /graphs returns 200 success and an array containing the graphs visible to the creating user.", async() => {
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


    test("GET /graphs returns 200 success and an array containing the graphs visible to users declared as administrator.", async() => {
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

});

describe("GET /graphs/{graphName} tests", () => {

    test("GET /graphs/{graphName} returns 200 success and the graph data when called by the creating user", async() => {
        const response: IResponse = await client.getGraph(user1, testGraph1);
        expect(response.status).toBe(200);
        expect(response.data).toMatchObject({
            graphName: testGraph1,
            administrators: [
                clusterHelper.userTokens[user1].user.userName,
                clusterHelper.userTokens[user3].user.userName
            ],
            currentState: "DEPLOYED",
            releaseName: testGraph1.toLowerCase()
        });
    });


    test("GET /graphs/{graphName} returns 200 success and the graph data when called by a user configured as a graph administrator.", async() => {
        const response: IResponse = await client.getGraph(user3, testGraph1);
        expect(response.status).toBe(200);
        expect(response.data).toMatchObject({
            graphName: testGraph1,
            administrators: [
                clusterHelper.userTokens[user1].user.userName,
                clusterHelper.userTokens[user3].user.userName
            ],
            currentState: "DEPLOYED",
            releaseName: testGraph1.toLowerCase()
        });
    });


    test("GET /graphs/{graphName} returns 403 forbidden when called by a user not permitted to view the graph", async() => {
        const response: IResponse = await client.getGraph(user2, testGraph1);
        expect(response.status).toBe(403);
        expect(response.data).toEqual("User: " + clusterHelper.userTokens[user2].user.userName + " is not authorized to retrieve graph: " + testGraph1);
    });


    test("GET /graphs/{graphName} returns 404 not found for a graphName not found", async() => {
        const response: IResponse = await client.getGraph(user1, "MadeUpGraphName");
        expect(response.status).toBe(404);
        expect(response.data).toEqual("MadeUpGraphName was not found");
    });

});

describe("POST /graphs failure tests", () => {

    test("POST /graphs returns a 400 error when graphName is not supplied", async() => {
        const schema: Record<string, unknown> = {
            "schema": schemaObject
        };
        const response: IResponse = await client.createGraph(user1, schema);
        expect(response.status).toBe(400);
        expect(response.data).toEqual("graphName is a required field which must made up of alphanumeric characters");
    });


    test("POST /graphs returns a 400 error when the graphName contains non alphanumeric characters", async() => {
        const schema: Record<string, unknown> = {
            "graphName": "non-alphanumeric_graphName",
            "schema": schemaObject
        };
        const response: IResponse = await client.createGraph(user1, schema);
        expect(response.status).toBe(400);
        expect(response.data).toEqual("graphName is a required field which must made up of alphanumeric characters");
    });


    test("POST /graphs returns a 400 error when the lower case graphName already exists", async() => {
        const schema: Record<string, unknown> = {
            "graphName": testGraph1.toUpperCase(),
            "schema": schemaObject
        };
        const response: IResponse = await client.createGraph(user1, schema);
        expect(response.status).toBe(400);
        expect(response.data).toMatch("Graph release name " + testGraph1.toLowerCase() + " already exists");
    });


    test("POST /graphs returns a 400 error when schema is not supplied", async() => {
        const schema: Record<string, unknown> = {
            "graphName": testGraph2
        };
        const response: IResponse = await client.createGraph(user1, schema);
        expect(response.status).toBe(400);
        expect(response.data).toEqual("schema is a required field");
    });


    test("POST /graphs returns a 400 error when attempting to configure administrators not registered in the Cognito UserPool.", async() => {
        const schema: Record<string, unknown> = {
            "graphName": testGraph2,
            "administrators": [ "InvalidCognitoUser" ],
            "schema": schemaObject
        };
        const response: IResponse = await client.createGraph(user1, schema);
        expect(response.status).toBe(400);
        expect(response.data).toMatch("Not all of the supplied administrators are valid Cognito users:");
    });

});

describe("DELETE /graphs/{graphName} failure tests", () => {

    test("DELETE /graphs/{graphName} returns 403 forbidden when called by a user who is not the creator or administrator of the graph.", async() => {
        const response: IResponse = await client.deleteGraph(user2, testGraph1);
        expect(response.status).toBe(403);
        expect(response.data).toEqual("User: " + clusterHelper.userTokens[user2].user.userName + " is not authorized to delete graph: " + testGraph1);
    });


    test("DELETE /graphs/{graphName} returns 400 when graphName does not exist.", async() => {
        const response: IResponse = await client.deleteGraph(user1, "MadeUpGraphName");
        expect(response.status).toBe(400);
        expect(response.data).toEqual("Graph MadeUpGraphName does not exist. It may have already been deleted");
    });

});

describe("Deleting a graph", () => {

    test("DELETE /graph/{graphName} returns 202 success and deletes a graph and associated resources when called by the creating user.", async() => {
        const response: IResponse = await client.deleteGraph(user1, testGraph1);
        expect(response.status).toBe(202);
        expect(response.data).toEqual("");
        expect(await client.awaitGraphDeletion(user1, testGraph1, graphDeploymentTimeoutMilliseconds)).toBe(true);
        expect(await volumeHelper.checkVolumesForGraphHaveBeenDeleted(testGraph1)).toBeTruthy();
        expect(await loadBalancerHelper.getApplicationLoadBalancersForGraph(testGraph1)).toHaveLength(0);
        expect(await loadBalancerHelper.getTargetGroupsForGraph(testGraph1)).toHaveLength(0);
    }, (graphDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));

});

describe("Recreating a graph with the same name", () => {

    test("POST /graphs successfully deploys a graph", async() => {
        const schema: Record<string, unknown> = {
            "graphName": testGraph1,
            "administrators": [ clusterHelper.userTokens[user3].user.userName ],
            "schema": schemaObject
        };
        const response: IResponse = await client.createGraph(user1, schema);
        expect(response.status).toBe(201);
        expect(response.data).toEqual("");
        expect(await client.awaitGraphDeployment(user1, testGraph1, graphDeploymentTimeoutMilliseconds)).toBe(true);
    }, (graphDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

});

describe("Deleting a graph by an administrator", () => {

    test("DELETE /graph/{graphName} returns 202 success and deletes a graph and associated resources when called by an administrator.", async() => {
        const response: IResponse = await client.deleteGraph(user3, testGraph1);
        expect(response.status).toBe(202);
        expect(response.data).toEqual("");
        expect(await client.awaitGraphDeletion(user3, testGraph1, graphDeploymentTimeoutMilliseconds)).toBe(true);
        expect(await volumeHelper.checkVolumesForGraphHaveBeenDeleted(testGraph1)).toBeTruthy();
        expect(await loadBalancerHelper.getApplicationLoadBalancersForGraph(testGraph1)).toHaveLength(0);
        expect(await loadBalancerHelper.getTargetGroupsForGraph(testGraph1)).toHaveLength(0);
    }, (graphDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));

});

describe.only("Creating a namespace", () => {

    test("GET /namespaces returns success and an empty array when there are no namespaces deployed.", async() => {
        const response: IResponse = await client.getNamespaces(user1);
        expect(response.status).toBe(200);
        expect(response.data).toEqual([]);
    });


    test("POST /namespaces successfully creates a non-public namespace", async() => {
        const data: Record<string, unknown> = {
            "namespaceName": "test-namespace-1",
            "administrators": [ clusterHelper.userTokens[user3].user.userName ],
            "public": false
        };
        const response: IResponse = await client.createNamespace(user1, data);
        expect(response.status).toBe(201);
        expect(response.data).toEqual("");
    });
});

afterAll(async() => {
    //await clusterHelper.destroyCluster();
});
