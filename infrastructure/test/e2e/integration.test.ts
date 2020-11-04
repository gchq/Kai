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
const minuteMilliseconds: number = 60 * 1000;
const clusterSetupTimeoutMilliseconds: number = 30 * minuteMilliseconds;
const graphDeploymentTimeoutMilliseconds: number = 10 * minuteMilliseconds;
const graphDeletionTimeoutMilliseconds: number = 10 * minuteMilliseconds;
const namespaceDeploymentTimeoutMilliseconds: number = 2 * minuteMilliseconds;
const namespaceDeletionTimeoutMilliseconds: number = 2 * minuteMilliseconds;
const user1 = "user1";
const user2 = "user2";
const user3 = "user3";
const testGraph1 = "testGraph1";
const testNamespace1 = "test-namespace-1";
const testNamespace2 = "test-namespace-2";

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

async function createNamespace(userName: string, namespaceName: string, administrators: string[], isPublic: boolean): Promise<void> {
    const data: Record<string, unknown> = {
        "namespaceName": namespaceName,
        "administrators": administrators,
        "isPublic": isPublic
    };
    const response: IResponse = await client.createNamespace(userName, data);
    expect(response.status).toBe(201);
    expect(response.data).toEqual("");
    expect(await client.awaitNamespaceDeployment(userName, namespaceName, namespaceDeploymentTimeoutMilliseconds)).toBe(true);
}

async function deleteNamespace(userName: string, namespaceName: string): Promise<void> {
    const response: IResponse = await client.deleteNamespace(userName, namespaceName);
    expect(response.status).toBe(202);
    expect(response.data).toEqual("");
    expect(await client.awaitNamespaceDeletion(userName, namespaceName, namespaceDeletionTimeoutMilliseconds)).toBe(true);
}

async function createGraph(userName: string, namespaceName: string, graphName: string, administrators: string[]): Promise<void> {
    const schema: Record<string, unknown> = {
        "graphName": graphName,
        "namespaceName": namespaceName,
        "administrators": administrators,
        "schema": schemaObject
    };
    const response: IResponse = await client.createGraph(userName, schema);
    expect(response.status).toBe(201);
    expect(response.data).toEqual("");
    expect(await client.awaitGraphDeployment(userName, namespaceName, graphName, graphDeploymentTimeoutMilliseconds)).toBe(true);
}

async function deleteGraph(userName: string, namespaceName: string, graphName: string): Promise<void> {
    const response: IResponse = await client.deleteNamespaceGraph(userName, namespaceName, graphName);
    expect(response.status).toBe(202);
    expect(response.data).toEqual("");
    expect(await client.awaitGraphDeletion(userName, namespaceName, graphName, graphDeletionTimeoutMilliseconds)).toBe(true);
    expect(await volumeHelper.checkVolumesForGraphHaveBeenDeleted(graphName)).toBeTruthy();
    expect(await loadBalancerHelper.getApplicationLoadBalancersForGraph(graphName)).toHaveLength(0);
    expect(await loadBalancerHelper.getTargetGroupsForGraph(graphName)).toHaveLength(0);
}

describe("Namespaces", () => {

    describe("Creating and deleting a namespace", () => {

        test("GET /namespaces returns success and an empty array when there are no namespaces deployed.", async() => {
            const response: IResponse = await client.getNamespaces(user1);
            expect(response.status).toBe(200);
            expect(response.data).toEqual([]);
        });

        test("POST /namespaces successfully creates a namespace", async() => {
            await createNamespace(user1, testNamespace1, [ clusterHelper.userTokens[user3].user.userName ], false);
        }, (namespaceDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

        test("DELETE /namespaces/{namespaceName} returns 202 success and successfully deletes the namespace when called by the creating user.", async() => {
            await deleteNamespace(user1, testNamespace1);
        }, (namespaceDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));

        test("POST /namespaces successfully recreates a namespace", async() => {
            await createNamespace(user1, testNamespace1, [ clusterHelper.userTokens[user3].user.userName ], false);
        }, (namespaceDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

        test("DELETE /namespaces/{namespaceName} returns 202 success and successfully deletes the namespace when called by an administrator.", async() => {
            await deleteNamespace(user3, testNamespace1);
        }, (namespaceDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));

    });

    describe("POST /namespaces invalid requests", () => {

        beforeAll(async() => {
            await createNamespace(user1, testNamespace1, [ clusterHelper.userTokens[user3].user.userName ], false);
        }, (namespaceDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

        afterAll(async() => {
            await deleteNamespace(user1, testNamespace1);
        }, (namespaceDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));

        test("POST /namespaces returns 400 when namespace already exists", async() => {
            const data: Record<string, unknown> = {
                "namespaceName": testNamespace1,
                "administrators": [],
                "isPublic": false
            };
            const response: IResponse = await client.createNamespace(user1, data);
            expect(response.status).toBe(400);
            expect(response.data).toEqual("Namespace " + testNamespace1 + " already exists, Namespace names must be unique.");
        });

        test("POST /namespaces returns 400 when namespace name not supplied", async() => {
            const data: Record<string, unknown> = {
                "administrators": [ clusterHelper.userTokens[user3].user.userName ],
                "isPublic": false
            };
            const response: IResponse = await client.createNamespace(user1, data);
            expect(response.status).toBe(400);
            expect(response.data).toEqual("namespaceName is a required field which must be a valid DNS label as defined in rfc-1123");
        });

        test("POST /namespaces returns 400 when namespace name is not valid", async() => {
            const data: Record<string, unknown> = {
                "namespaceName": "InvalidNamespaceName",
                "administrators": [ clusterHelper.userTokens[user3].user.userName ],
                "isPublic": false
            };
            const response: IResponse = await client.createNamespace(user1, data);
            expect(response.status).toBe(400);
            expect(response.data).toEqual("namespaceName is a required field which must be a valid DNS label as defined in rfc-1123");
        });

        test("POST /namespaces returns a 400 error when attempting to configure administrators not registered in the Cognito UserPool.", async() => {
            const data: Record<string, unknown> = {
                "namespaceName": testNamespace1,
                "administrators": [ "InvalidCognitoUser" ],
                "isPublic": false
            };
            const response: IResponse = await client.createNamespace(user1, data);
            expect(response.status).toBe(400);
            expect(response.data).toMatch("Not all of the supplied administrators are valid Cognito users:");
        });
    });

    describe("Retrieving a non-public namespace", () => {

        beforeAll(async() => {
            await createNamespace(user1, testNamespace1, [ clusterHelper.userTokens[user3].user.userName ], false);
        }, (namespaceDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

        afterAll(async() => {
            await deleteNamespace(user1, testNamespace1);
        }, (namespaceDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));

        test("GET /namespaces/{namespaceName} returns 200 success and the namespace data when called by the creating user.", async() => {
            await checkUserCanRetrieveNamespace(user1, testNamespace1);
        });

        test("GET /namespaces/{namespaceName} returns 200 success and the namespace data when called by a user configured as a namespace administrator.", async() => {
            await checkUserCanRetrieveNamespace(user3, testNamespace1);
        });

        test("GET /namespaces/{namespaceName} returns 403 forbidden when called by a user not permitted to view the namespace", async() => {
            const response: IResponse = await client.getNamespace(user2, testNamespace1);
            expect(response.status).toBe(403);
            expect(response.data).toEqual("User: " + clusterHelper.userTokens[user2].user.userName + " is not authorized to retrieve namespace: " + testNamespace1);
        });

        test("GET /namespaces/{namespaceName} returns 404 for a namespace name not found", async() => {
            const response: IResponse = await client.getNamespace(user1, "made-up-namespace");
            expect(response.status).toBe(404);
            expect(response.data).toEqual("made-up-namespace was not found");
        });

        async function checkUserCanRetrieveNamespace(userName: string, namespaceName: string): Promise<void> {
            const response: IResponse = await client.getNamespace(userName, namespaceName);
            expect(response.status).toBe(200);
            expect(response.data).toMatchObject({
                namespaceName: namespaceName,
                administrators: [
                    clusterHelper.userTokens[user1].user.userName,
                    clusterHelper.userTokens[user3].user.userName
                ],
                currentState: "DEPLOYED",
                isPublic: false
            });
        }
    });

    describe("Retrieving a public namespace", () => {

        beforeAll(async() => {
            await createNamespace(user1, testNamespace1, [], true);
        }, (namespaceDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

        afterAll(async() => {
            await deleteNamespace(user1, testNamespace1);
        }, (namespaceDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));

        test("GET /namespaces/{namespaceName} returns 200 success and the namespace data when called by the creating user.", async() => {
            await checkUserCanRetrieveNamespace(user1, testNamespace1);
        });

        test("GET /namespaces/{namespaceName} returns 200 success and the namespace data when called by any user.", async() => {
            await checkUserCanRetrieveNamespace(user2, testNamespace1);
        });

        async function checkUserCanRetrieveNamespace(userName: string, namespaceName: string): Promise<void> {
            const response: IResponse = await client.getNamespace(userName, namespaceName);
            expect(response.status).toBe(200);
            expect(response.data).toMatchObject({
                namespaceName: namespaceName,
                administrators: [
                    clusterHelper.userTokens[user1].user.userName
                ],
                currentState: "DEPLOYED",
                isPublic: true
            });
        }
    });

    describe("Updating a namespace", () => {

        beforeAll(async() => {
            await createNamespace(user1, testNamespace1, [], false);
        }, (namespaceDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

        afterAll(async() => {
            await deleteNamespace(user1, testNamespace1);
        }, (namespaceDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));

        test("POST /namespaces/{namespaceName} returns 200 and successfully updates the namespace when called by the creating user.", async() => {
            const data: Record<string, unknown> = {
                "administrators": [
                    clusterHelper.userTokens[user2].user.userName
                ],
                "isPublic": true
            };
            const response: IResponse = await client.updateNamespace(user1, testNamespace1, data);
            expect(response.status).toBe(200);
            expect(response.data).toEqual("");

            const getResponse: IResponse = await client.getNamespace(user1, testNamespace1);
            expect(getResponse.status).toBe(200);
            expect(getResponse.data).toMatchObject({
                namespaceName: testNamespace1,
                administrators: [
                    clusterHelper.userTokens[user1].user.userName,
                    clusterHelper.userTokens[user2].user.userName
                ],
                currentState: "DEPLOYED",
                isPublic: true
            });
        });

        test("POST /namespaces/{namespaceName} returns 200 and successfully updates the namespace when called by an administrator.", async() => {
            const data: Record<string, unknown> = {
                "administrators": [
                    clusterHelper.userTokens[user1].user.userName
                ],
                "isPublic": true
            };
            const response: IResponse = await client.updateNamespace(user2, testNamespace1, data);
            expect(response.status).toBe(200);
            expect(response.data).toEqual("");

            const getResponse: IResponse = await client.getNamespace(user2, testNamespace1);
            expect(getResponse.status).toBe(200);
            expect(getResponse.data).toMatchObject({
                namespaceName: testNamespace1,
                administrators: [
                    clusterHelper.userTokens[user2].user.userName,
                    clusterHelper.userTokens[user1].user.userName
                ],
                currentState: "DEPLOYED",
                isPublic: true
            });
        });

        test("POST /namespaces/{namespaceName} returns 404 when namespace name not found", async() => {
            const data: Record<string, unknown> = {
                "administrators": [ clusterHelper.userTokens[user3].user.userName ],
                "isPublic": false
            };
            const response: IResponse = await client.updateNamespace(user2, "not-found-namespace-1", data);
            expect(response.status).toBe(404);
            expect(response.data).toEqual("not-found-namespace-1 was not found");
        });

        test("POST /namespaces/{namespaceName} returns 400 when namespace name is not valid", async() => {
            const data: Record<string, unknown> = {
                "administrators": [ clusterHelper.userTokens[user3].user.userName ],
                "isPublic": false
            };
            const response: IResponse = await client.updateNamespace(user2, "InvalidNamespaceName", data);
            expect(response.status).toBe(400);
            expect(response.data).toEqual("namespaceName is a required field which must be a valid DNS label as defined in rfc-1123");
        });

        test("POST /namespaces/{namespaceName} returns a 400 error when attempting to configure administrators not registered in the Cognito UserPool.", async() => {
            const data: Record<string, unknown> = {
                "administrators": [ "InvalidCognitoUser" ],
                "isPublic": true
            };
            const response: IResponse = await client.updateNamespace(user2, testNamespace1, data);
            expect(response.status).toBe(400);
            expect(response.data).toMatch("Not all of the supplied administrators are valid Cognito users:");
        });

        test("POST /namespaces/{namespaceName} returns 403 forbidden when called by a user without permission to update the namespace.", async() => {
            const data: Record<string, unknown> = {
                "administrators": [],
                "isPublic": true
            };
            const response: IResponse = await client.updateNamespace(user3, testNamespace1, data);
            expect(response.status).toBe(403);
            expect(response.data).toEqual("User: " + clusterHelper.userTokens[user3].user.userName + " is not authorized to update namespace: " + testNamespace1);
        });
    });

    describe("Deleting a namespace", () => {

        beforeAll(async() => {
            await createNamespace(user1, testNamespace1, [], true);
        }, (namespaceDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

        test("DELETE /namespaces/{namespaceName} returns 400 when namespace name not valid", async() => {
            const response: IResponse = await client.deleteNamespace(user1, "InvalidNamespaceName");
            expect(response.status).toBe(400);
            expect(response.data).toEqual("namespaceName is a required field which must be a valid DNS label");
        });

        test("DELETE /namespaces/{namespaceName} returns 400 when namespace name not found", async() => {
            const response: IResponse = await client.deleteNamespace(user1, "not-found-namespace-1");
            expect(response.status).toBe(400);
            expect(response.data).toEqual("Namespace not-found-namespace-1 does not exist. It may have already have been deleted");
        });

        test("DELETE /namespaces/{namespaceName} returns 403 forbidden when called by a user without permission to update the namespace.", async() => {
            const response: IResponse = await client.deleteNamespace(user2, testNamespace1);
            expect(response.status).toBe(403);
            expect(response.data).toEqual("User: " + clusterHelper.userTokens[user2].user.userName + " is not authorized to delete namespace: " + testNamespace1);
        });

        test("DELETE /namespaces/{namespaceName} by the creator is successful", async() => {
            await deleteNamespace(user1, testNamespace1);
        }, (namespaceDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));
    });

    describe("An administrator deleting a namespace", () => {

        beforeAll(async() => {
            await createNamespace(user1, testNamespace1, [clusterHelper.userTokens[user3].user.userName], true);
        }, (namespaceDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

        test("DELETE /namespaces/{namespaceName} by an administrator is successful", async() => {
            await deleteNamespace(user3, testNamespace1);
        }, (namespaceDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));
    });
});

describe("Graphs", () => {

    describe("Creating and deleting a graph in a private namespace", () => {

        beforeAll(async() => {
            await createNamespace(user1, testNamespace1, [clusterHelper.userTokens[user3].user.userName], false);
        }, (namespaceDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

        afterAll(async() => {
            await deleteNamespace(user1, testNamespace1);
        }, (namespaceDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));

        test("GET /graphs returns success and an empty array when there are no graphs deployed.", async() => {
            const response: IResponse = await client.getGraphs(user1);
            expect(response.status).toBe(200);
            expect(response.data).toEqual([]);
        });

        test("POST /graphs successfully deploys a graph", async() => {
            await createGraph(user1, testNamespace1, testGraph1, [clusterHelper.userTokens[user3].user.userName]);
        }, (graphDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

        test("POST /graphs returns a 400 error when the lower case graphName already exists", async() => {
            const schema: Record<string, unknown> = {
                "graphName": testGraph1.toUpperCase(),
                "namespaceName": testNamespace1,
                "schema": schemaObject
            };
            const response: IResponse = await client.createGraph(user1, schema);
            expect(response.status).toBe(400);
            expect(response.data).toMatch("Graph release name: " + testGraph1.toLowerCase() + " already exists in namespace: " + testNamespace1 + ". Lowercase Graph names must be unique within a namespace.");
        });

        test("DELETE /graphs successfully deletes a graph", async() => {
            await deleteGraph(user1, testNamespace1, testGraph1);
        }, (graphDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));
    });

    describe("Attempt to create a graph in a private namespace by user without permission", () => {

        beforeAll(async() => {
            await createNamespace(user1, testNamespace1, [clusterHelper.userTokens[user3].user.userName], false);
        }, (namespaceDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

        afterAll(async() => {
            await deleteNamespace(user1, testNamespace1);
        }, (namespaceDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));

        test("POST /graphs returns a 403 forbidden when the user is not permitted to deploy graphs in the namespace", async() => {
            const schema: Record<string, unknown> = {
                "graphName": testGraph1,
                "namespaceName": testNamespace1,
                "schema": schemaObject
            };
            const response: IResponse = await client.createGraph(user2, schema);
            expect(response.status).toBe(403);
            expect(response.data).toMatch("User " + clusterHelper.userTokens[user2].user.userName + " is not permitted to deploy a graph into namespace: " + testNamespace1);
        });
    });

    describe("Creating and deleting a graph in a public namespace", () => {

        beforeAll(async() => {
            await createNamespace(user1, testNamespace1, [clusterHelper.userTokens[user3].user.userName], true);
        }, (namespaceDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

        afterAll(async() => {
            await deleteNamespace(user1, testNamespace1);
        }, (namespaceDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));

        test("POST /graphs successfully deploys a graph", async() => {
            await createGraph(user2, testNamespace1, testGraph1, []);
        }, (graphDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

        test("DELETE /graphs successfully deletes a graph", async() => {
            await deleteGraph(user2, testNamespace1, testGraph1);
        }, (graphDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));
    });

    describe("Invalid POST /graphs tests", () => {

        beforeAll(async() => {
            await createNamespace(user1, testNamespace1, [], false);
        }, (namespaceDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

        afterAll(async() => {
            await deleteNamespace(user1, testNamespace1);
        }, (namespaceDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));

        test("POST /graphs returns a 400 error when graphName is not supplied", async() => {
            const schema: Record<string, unknown> = {
                "namespaceName": testNamespace1,
                "schema": schemaObject
            };
            const response: IResponse = await client.createGraph(user1, schema);
            expect(response.status).toBe(400);
            expect(response.data).toEqual("graphName is a required field which must made up of alphanumeric characters");
        });

        test("POST /graphs returns a 400 error when namespaceName is not supplied", async() => {
            const schema: Record<string, unknown> = {
                "graphName": testGraph1,
                "schema": schemaObject
            };
            const response: IResponse = await client.createGraph(user1, schema);
            expect(response.status).toBe(400);
            expect(response.data).toEqual("namespaceName is a required field which must be a valid DNS label");
        });

        test("POST /graphs returns a 400 error when the graphName contains non alphanumeric characters", async() => {
            const schema: Record<string, unknown> = {
                "graphName": "non-alphanumeric_graphName",
                "namespaceName": testNamespace1,
                "schema": schemaObject
            };
            const response: IResponse = await client.createGraph(user1, schema);
            expect(response.status).toBe(400);
            expect(response.data).toEqual("graphName is a required field which must made up of alphanumeric characters");
        });

        test("POST /graphs returns a 400 error when schema is not supplied", async() => {
            const schema: Record<string, unknown> = {
                "graphName": testGraph1,
                "namespaceName": testNamespace1
            };
            const response: IResponse = await client.createGraph(user1, schema);
            expect(response.status).toBe(400);
            expect(response.data).toEqual("schema is a required field");
        });

        test("POST /graphs returns a 400 error when attempting to configure administrators not registered in the Cognito UserPool.", async() => {
            const schema: Record<string, unknown> = {
                "graphName": testGraph1,
                "namespaceName": testNamespace1,
                "administrators": [ "InvalidCognitoUser" ],
                "schema": schemaObject
            };
            const response: IResponse = await client.createGraph(user1, schema);
            expect(response.status).toBe(400);
            expect(response.data).toMatch("Not all of the supplied administrators are valid Cognito users:");
        });
    });

    describe("GET /graphs tests", () => {

        beforeAll(async() => {
            await createNamespace(user1, testNamespace1, [], false);
            await createGraph(user1, testNamespace1, testGraph1, [clusterHelper.userTokens[user3].user.userName]);
        }, (namespaceDeploymentTimeoutMilliseconds + graphDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

        afterAll(async() => {
            await deleteGraph(user1, testNamespace1, testGraph1);
            await deleteNamespace(user1, testNamespace1);
        }, (namespaceDeletionTimeoutMilliseconds + graphDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));

        test("GET /graphs returns 200 success and an array containing the graphs visible to users declared as administrator.", async() => {
            await checkUserCanRetrieveGraph(user1);
        });

        test("GET /graphs returns 200 success and an array containing the graphs visible to users declared as administrator.", async() => {
            await checkUserCanRetrieveGraph(user3);
        });

        async function checkUserCanRetrieveGraph(userName: string): Promise<void> {
            const response: IResponse = await client.getGraphs(userName);
            expect(response.status).toBe(200);
            expect(response.data).toHaveLength(1);
            expect(response.data[0]).toMatchObject({
                graphName: testGraph1,
                administrators: [
                    clusterHelper.userTokens[user1].user.userName,
                    clusterHelper.userTokens[user3].user.userName
                ],
                endpoints: {
                    "testgraph1-gaffer-api": expect.stringMatching(/.*eu-west-1.elb.amazonaws.com/),
                    "testgraph1-gaffer-monitor": expect.stringMatching(/.*eu-west-1.elb.amazonaws.com/),
                    "testgraph1-hdfs": expect.stringMatching(/.*eu-west-1.elb.amazonaws.com/)
                },
                currentState: "DEPLOYED",
                releaseName: testGraph1.toLowerCase(),
                namespaceName: testNamespace1
            });
        }
    });

    describe("GET /namespaces/{namespaceName}/graphs/{graphName} tests", () => {

        beforeAll(async() => {
            await createNamespace(user1, testNamespace1, [clusterHelper.userTokens[user3].user.userName], false);
            await createNamespace(user1, testNamespace2, [clusterHelper.userTokens[user3].user.userName], false);
            await createGraph(user1, testNamespace1, testGraph1, [clusterHelper.userTokens[user3].user.userName]);
        }, (namespaceDeploymentTimeoutMilliseconds + graphDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

        afterAll(async() => {
            await deleteGraph(user1, testNamespace1, testGraph1);
            await deleteNamespace(user1, testNamespace1);
            await deleteNamespace(user1, testNamespace2);
        }, (namespaceDeletionTimeoutMilliseconds + graphDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));

        test("GET /namespaces/{namespaceName}/graphs/{graphName} returns 404 not found for a graphName not found", async() => {
            const response: IResponse = await client.getNamespaceGraph(user1, testNamespace1, "MadeUpGraphName");
            expect(response.status).toBe(404);
            expect(response.data).toEqual("MadeUpGraphName was not found in namespace " + testNamespace1);
        });

        test("GET /namespaces/{namespaceName}/graphs/{graphName} returns 404 not found when the graph does not exist in the namespace", async() => {
            const response: IResponse = await client.getNamespaceGraph(user1, testNamespace2, testGraph1);
            expect(response.status).toBe(404);
            expect(response.data).toEqual(testGraph1 + " was not found in namespace " + testNamespace2);
        });

        test("GET /namespaces/{namespaceName}/graphs/{graphName} returns 403 forbidden when called by a user not permitted to view the graph", async() => {
            const response: IResponse = await client.getNamespaceGraph(user2, testNamespace1, testGraph1);
            expect(response.status).toBe(403);
            expect(response.data).toEqual("User: " + clusterHelper.userTokens[user2].user.userName + " is not authorized to retrieve graph: " + testGraph1 + " from namespace: " + testNamespace1);
        });

        test("GET /namespaces/{namespaceName}/graphs/{graphName} returns 200 success and the graph data when called by the creating user", async() => {
            await checkUserCanRetrieveGraph(user1);
        });

        test("GET /namespaces/{namespaceName}/graphs/{graphName} returns 200 success and the graph data when called by a user configured as a graph administrator.", async() => {
            await checkUserCanRetrieveGraph(user3);
        });

        async function checkUserCanRetrieveGraph(userName: string): Promise<void> {
            const response: IResponse = await client.getNamespaceGraph(userName, testNamespace1, testGraph1);
            expect(response.status).toBe(200);
            expect(response.data).toMatchObject({
                graphName: testGraph1,
                administrators: [
                    clusterHelper.userTokens[user1].user.userName,
                    clusterHelper.userTokens[user3].user.userName
                ],
                endpoints: {
                    "testgraph1-gaffer-api": expect.stringMatching(/.*eu-west-1.elb.amazonaws.com/),
                    "testgraph1-gaffer-monitor": expect.stringMatching(/.*eu-west-1.elb.amazonaws.com/),
                    "testgraph1-hdfs": expect.stringMatching(/.*eu-west-1.elb.amazonaws.com/)
                },
                currentState: "DEPLOYED",
                releaseName: testGraph1.toLowerCase(),
                namespaceName: testNamespace1
            });
        }
    });

    describe("DELETE /namespaces/{namespaceName}/graphs/{graphName} tests", () => {

        beforeAll(async() => {
            await createNamespace(user1, testNamespace1, [], false);
            await createGraph(user1, testNamespace1, testGraph1, [clusterHelper.userTokens[user3].user.userName]);
        }, (namespaceDeploymentTimeoutMilliseconds + graphDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));

        afterAll(async() => {
            await deleteGraph(user1, testNamespace1, testGraph1);
            await deleteNamespace(user1, testNamespace1);
        }, (namespaceDeletionTimeoutMilliseconds + graphDeletionTimeoutMilliseconds + (2 * minuteMilliseconds)));

        test("DELETE /namespaces/{namespaceName}/graphs/{graphName} returns 403 forbidden when called by a user who is not the creator or administrator of the graph.", async() => {
            const response: IResponse = await client.deleteNamespaceGraph(user2, testNamespace1, testGraph1);
            expect(response.status).toBe(403);
            expect(response.data).toEqual("User: " + clusterHelper.userTokens[user2].user.userName + " is not authorized to delete graph: " + testGraph1 + " in namespace: test-namespace-1");
        });

        test("DELETE /namespaces/{namespaceName}/graphs/{graphName} returns 400 when graphName does not exist.", async() => {
            const response: IResponse = await client.deleteNamespaceGraph(user1, testNamespace1, "MadeUpGraphName");
            expect(response.status).toBe(400);
            expect(response.data).toEqual("Graph: MadeUpGraphName in namespace: test-namespace-1 does not exist. It may have already been deleted");
        });

        test("DELETE /namespaces/{namespaceName} returns 400 when namespace contains deployed graphs.", async() => {
            const response: IResponse = await client.deleteNamespace(user1, testNamespace1);
            expect(response.status).toBe(400);
            expect(response.data).toEqual("Unable to delete Namespace: " + testNamespace1 + ", the graphs: ['" + testGraph1 + "'] deployed to this namespace and must be deleted first.");
        });
    });
});

afterAll(async() => {
    await clusterHelper.destroyCluster();
});
