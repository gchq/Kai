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
import { UserHelper } from "./setup/user-helper";

const clusterHelper: ClusterHelper = new ClusterHelper();
const userHelper: UserHelper = new UserHelper(clusterHelper.stackName);

let user1Token: string | void;
let user2Token: string | void;


beforeAll(async() => {
    await clusterHelper.deployCluster();
    user1Token = await userHelper.createUserAuthenticationToken(clusterHelper.userPool, "user1");
    user2Token = await userHelper.createUserAuthenticationToken(clusterHelper.userPool, "user2");
});

test("ztest 1", () => {
    console.log("test 1: token" + user1Token);
});

test("ytest 2", () => {
    console.log("test 2");
});

test("xtest 3", () => {
    console.log("test 3");
});

afterAll(async() => {
    //await clusterHelper.destroyCluster();
});
