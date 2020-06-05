import * as cdk from "@aws-cdk/core";
import * as sam from "@aws-cdk/aws-sam";
import { GraphPlatForm } from "./platform/graph-platform";
import { KaiRestApi } from "./rest-api/kai-rest-api";
import { LAMBDA_LAYER_ARN, LAMBDA_LAYER_VERSION } from "./constants";
import { LayerVersion } from "@aws-cdk/aws-lambda";
import { AddGraphWorker } from "./workers/add-graph-worker";

// The main stack for Kai
export class AppStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        // Graph Platform
        const platform = new GraphPlatForm(this, "GraphPlatform");

        // REST API
        const kaiRest = new KaiRestApi(this, "KaiRestApi");

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
            kubectlLayer: kubectlLambdaLayer
        });
    }
}