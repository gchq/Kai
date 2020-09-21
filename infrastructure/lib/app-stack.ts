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
import { GraphUninstaller } from "./platform/graph-uninstaller";
import { KaiRestApi } from "./rest-api/kai-rest-api";
import { 
    LAMBDA_LAYER_ARN, 
    LAMBDA_LAYER_VERSION, 
    ADD_GRAPH_TIMEOUT, 
    DELETE_GRAPH_TIMEOUT, 
    DELETE_GRAPH_WORKER_BATCH_SIZE, 
    ADD_GRAPH_WORKER_BATCH_SIZE,
    ADD_NAMESPACE_TIMEOUT, 
    DELETE_NAMESPACE_TIMEOUT, 
    DELETE_NAMESPACE_WORKER_BATCH_SIZE, 
    ADD_NAMESPACE_WORKER_BATCH_SIZE 
} from "./constants";
import { LayerVersion } from "@aws-cdk/aws-lambda";
import { Database } from "./database/database";
import { Worker } from "./workers/worker";
import { KaiUserPool } from "./authentication/user-pool";
import { DatabaseProps } from "./database/database-props";
import { PolicyStatement } from "@aws-cdk/aws-iam";

// The main stack for Kai
export class AppStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        // User Pool
        const userPool = new KaiUserPool(this, "KaiUserPool");

        // Graph Platform
        const platform = new GraphPlatForm(this, "GraphPlatform");

        // Graph Table
        const databaseProps: DatabaseProps = this.node.tryGetContext("databaseProps");
        const database = new Database(this, "GraphDatabase", databaseProps);

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

        // REST API
        const kaiRest = new KaiRestApi(this, "KaiRestApi", {
            clusterName: platform.eksCluster.clusterName,
            graphTable: database.graphTable,
            namespaceTable: database.namespaceTable,
            userPoolArn: userPool.userPoolArn,
            userPoolId: userPool.userPoolId
        });

        // Describe EKS cluster policy statement
        const describeClusterPolicyStatement = new PolicyStatement({
            actions: [ "eks:DescribeCluster" ],
            resources: [ platform.eksCluster.clusterArn ]
        });

        // Manage EBS Volumes policy statement
        const manageVolumesPolicyStatement = new PolicyStatement({
            resources: ["*"],
            actions: [
                "ec2:DescribeVolumes",
                "ec2:DeleteVolume"
            ]
        });

        // Graph Workers
        new Worker(this, "AddGraphWorker", {
            cluster: platform.eksCluster,
            queue: kaiRest.addGraphQueue,
            kubectlLayer: kubectlLambdaLayer,
            table: database.graphTable,
            handler: "add_graph.handler",
            timeout: ADD_GRAPH_TIMEOUT,
            batchSize: ADD_GRAPH_WORKER_BATCH_SIZE,
            policyStatements: [
                describeClusterPolicyStatement
            ]
        });

        const deleteGraphWorker = new Worker(this, "DeleteGraphWorker", {
            cluster: platform.eksCluster,
            queue: kaiRest.deleteGraphQueue,
            kubectlLayer: kubectlLambdaLayer,
            table: database.graphTable,
            handler: "delete_graph.handler",
            timeout: DELETE_GRAPH_TIMEOUT,
            batchSize: DELETE_GRAPH_WORKER_BATCH_SIZE,
            policyStatements: [
                describeClusterPolicyStatement,
                manageVolumesPolicyStatement
            ]
        });

        // Namespace Workers
        new Worker(this, "AddNamespaceWorker", {
            cluster: platform.eksCluster,
            queue: kaiRest.addNamespaceQueue,
            kubectlLayer: kubectlLambdaLayer,
            table: database.namespaceTable,
            handler: "add_namespace.handler",
            timeout: ADD_NAMESPACE_TIMEOUT,
            batchSize: ADD_NAMESPACE_WORKER_BATCH_SIZE,
            policyStatements: [
                describeClusterPolicyStatement
            ]
        });

        new Worker(this, "DeleteNamespaceWorker", {
            cluster: platform.eksCluster,
            queue: kaiRest.deleteNamespaceQueue,
            kubectlLayer: kubectlLambdaLayer,
            table: database.namespaceTable,
            handler: "delete_namespace.handler",
            timeout: DELETE_NAMESPACE_TIMEOUT,
            batchSize: DELETE_NAMESPACE_WORKER_BATCH_SIZE,
            policyStatements: [
                describeClusterPolicyStatement
            ]
        });

        // Graph uninstaller
        new GraphUninstaller(this, "GraphUninstaller", {
            getGraphsFunctionArn: kaiRest.getGraphsLambda.functionArn,
            deleteGraphFunctionArn: kaiRest.deleteGraphLambda.functionArn,
            kubectlLayer: kubectlLambdaLayer,
            timeout: cdk.Duration.seconds(30),
            dependencies: [
                platform,
                database,
                deleteGraphWorker,
                kaiRest.getGraphsLambda,
                kaiRest.deleteGraphLambda,
                kaiRest.deleteGraphQueue
            ]
        });
    }
}