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
import { IResponse, RestApiClient } from "./client/rest-api-client";

const clusterHelper: ClusterHelper = new ClusterHelper();
const clusterSetupTimeoutMilliseconds: number = 30 * 60 * 1000;
const graphDeploymentTimeoutMilliseconds: number = 10 * 60 * 1000;
const minuteMilliseconds: number = 60 * 1000;
const user1 = "user1";
const user2 = "user2";
const testGraph1 = "testGraph1";

let client: RestApiClient;

beforeAll(
    async() => {
        await clusterHelper.deployCluster([ user1, user2 ]);
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
    const response: IResponse = await client.createGraph(user1, testGraph1);
    expect(response.status).toBe(201);
    expect(response.data).toEqual("");
    expect(await client.awaitGraphDeployment(user1, testGraph1, graphDeploymentTimeoutMilliseconds)).toBe(true);
}, (graphDeploymentTimeoutMilliseconds + (2 * minuteMilliseconds)));


test("GET /graphs returns success and an empty array when user does not have permission to view deployed graphs .", async() => {
    const response: IResponse = await client.getGraphs(user2);
    expect(response.status).toBe(200);
    expect(response.data).toEqual([]);
});


test("GET /graphs returns success and an array containing the graphs visible to the user.", async() => {
    const response: IResponse = await client.getGraphs(user1);
    expect(response.status).toBe(200);
    expect(response.data).toHaveLength(1);
    expect(response.data[0]).toMatchObject({
        graphName: testGraph1,
        administrators: [
            clusterHelper.stackName + "-" + user1
        ],
        currentState: "DEPLOYED",
        releaseName: testGraph1.toLowerCase()
    });
});


afterAll(async() => {
    //await clusterHelper.destroyCluster();
});
