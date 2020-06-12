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
import * as sam from "@aws-cdk/aws-sam";
import { GraphPlatForm } from "./platform/graph-platform";
import { KaiRestApi } from "./rest-api/kai-rest-api";
import { LAMBDA_LAYER_ARN, LAMBDA_LAYER_VERSION } from "./constants";
import { LayerVersion } from "@aws-cdk/aws-lambda";
import { AddGraphWorker } from "./workers/add-graph-worker";
import { GraphDatabase } from "./database/graph-database";

// The main stack for Kai
export class AppStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        // Graph Platform
        const platform = new GraphPlatForm(this, "GraphPlatform");

        // Graph Table
        const database = new GraphDatabase(this, "GraphDatabase");

        // REST API
        const kaiRest = new KaiRestApi(this, "KaiRestApi", {
            graphTableName: database.tableName
        });

        // Kubectl Lambda layer
        const samApp = new sam.CfnApplication(this, "SamLayer", {
            location: {
            applicationId: LAMBDA_LAYER_ARN,
            semanticVersion: LAMBDA_LAYER_VERSION
            },
            parameters: {
            LayerName: `${this.node.uniqueId}-kubectl-layer`
            }
        });

        const layerVersionArn = samApp.getAtt("Outputs.LayerVersionArn").toString();
        const kubectlLambdaLayer = LayerVersion.fromLayerVersionArn(this, "KubectlLambdaLayer", layerVersionArn);

        // Workers
        new AddGraphWorker(this, "AddGraphWorker", {
            cluster: platform.eksCluster,
            queue: kaiRest.addGraphQueue,
            kubectlLayer: kubectlLambdaLayer,
            graphTableName: database.tableName
        });
    }
}