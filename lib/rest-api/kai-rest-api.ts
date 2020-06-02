import * as cdk from "@aws-cdk/core";
import * as sam from "@aws-cdk/aws-sam";
import * as api from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";
import * as lamdba from "@aws-cdk/aws-lambda";
import * as path from 'path';
import { Runtime, AssetCode } from "@aws-cdk/aws-lambda";
import { LambdaIntegration } from "@aws-cdk/aws-apigateway";
import { KaiRestApiProps } from "./kai-rest-api-props";

export class KaiRestApi extends cdk.Construct {
    private static readonly LAMBDA_LAYER_ARN: string = 'arn:aws:serverlessrepo:us-east-1:903779448426:applications/lambda-layer-kubectl';
    private static readonly LAMBDA_LAYER_VERSION: string = "2.0.0-beta3"

    constructor(scope: cdk.Construct, id: string, props: KaiRestApiProps) {
        super(scope, id);

        // Kubectl Lambda layer
        const samApp = new sam.CfnApplication(this, 'SamLayer', {
            location: {
            applicationId: KaiRestApi.LAMBDA_LAYER_ARN,
            semanticVersion: KaiRestApi.LAMBDA_LAYER_VERSION
            },
            parameters: {
            LayerName: `${this.node.uniqueId}-kubectl-layer`
            }
        })

        const layerVersionArn = samApp.getAtt('Outputs.LayerVersionArn').toString();
        const kubectlLambdaLayer = lamdba.LayerVersion.fromLayerVersionArn(this, "KubectlLambdaLayer", layerVersionArn)
        
        // REST API
        const restApi = new api.RestApi(this, "RestApi");
        const graphResource = restApi.root.addResource("graphs") // Could add a default 404 handler here
        
        // Add Graph handler
        const addGraphLambda = new lamdba.Function(this, "AddGraphLambda", {
            runtime: Runtime.NODEJS_12_X,
            code: new AssetCode(path.join(__dirname, "lambdas")),
            handler: "add_graph.handler",
            layers: [ kubectlLambdaLayer ],
            environment: {
                clusterName: props.cluster.clusterName
            }
        });

        // Add permisssions to role
        addGraphLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: [ "eks:DescribeCluster" ],
            resources: [ props.cluster.clusterArn ]
        }));

        props.cluster.awsAuth.addMastersRole(addGraphLambda.role!); // todo test that a role is actually created
        
        graphResource.addMethod("POST", new LambdaIntegration(addGraphLambda))
    }
}