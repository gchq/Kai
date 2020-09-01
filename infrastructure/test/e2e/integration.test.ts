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

import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ClusterHelper } from "./setup/cluster-helper";

const clusterHelper: ClusterHelper = new ClusterHelper();
const clusterSetupTimeoutMilliseconds: number = 30 * 60 * 1000;

beforeAll(
    async() => {
        await clusterHelper.deployCluster([ "user1", "user2" ]);
    },
    clusterSetupTimeoutMilliseconds
);

test("GET /graphs returns success and an empty array when there are no graphs deployed.", async() => {

    const response: AxiosResponse | void = await axios({
        method: "get",
        responseType: "json",
        headers: {"Authorization": clusterHelper.userIdToken("user1")},
        baseURL: clusterHelper.restApiEndpoint,
        url: "/graphs"
    }).then(
        (response: AxiosResponse) => {
            return response;
        }
    );

    if (response) {
        console.log("Response received, status : " + response.status);
        expect(response.status).toBe(200);
        expect(response.data).toEqual(JSON.parse("[]"));
    } else {
        fail("No response received");
    }
});


afterAll(async() => {
    await clusterHelper.destroyCluster();
});
