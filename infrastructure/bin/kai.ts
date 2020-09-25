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

import * as cdk from "@aws-cdk/core";
import { AppStack } from "../lib/app-stack";

// App
const app = new cdk.App();

// Environment
const dev = { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
};

let stackName: string = app.node.tryGetContext("stackName");
if (!stackName) {
    stackName = "KaiStack";
}

// Main Stack
new AppStack(app, stackName, {
    env: dev,
    stackName: stackName
});

// Tags
let tags: Map<string, string> = app.node.tryGetContext("globalTags");
// CDK does not support json parsing when using the --context option so we must parse it ourselves here
if (tags != null) {
    if (typeof tags == "string") {
        tags = JSON.parse(tags);
    }

    for (const [key, value] of Object.entries(tags)) {
        cdk.Tag.add(app, key, value);
    }
}           

