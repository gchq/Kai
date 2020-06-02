#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { AppStack } from '../lib/app-stack';

// App
const app = new cdk.App();

// Environment
const dev = { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
};

// Main Stack
new AppStack(app, "KaiStack", {
    env: dev,
    stackName: "KaiStack"
})

// Tags
let tags: Map<string, string> = app.node.tryGetContext("globalTags");
// CDK does not support json parsing when using the --context option so we must parse it ourselves here
if (tags != null) {
    if (typeof tags == "string") {
        tags = JSON.parse(tags);
    }

    for (let [key, value] of Object.entries(tags)) {
        cdk.Tag.add(app, key, value);
    }
}           

