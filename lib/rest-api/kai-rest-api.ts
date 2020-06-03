import * as cdk from "@aws-cdk/core";
import * as sam from "@aws-cdk/aws-sam";
import * as api from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";
import * as lamdba from "@aws-cdk/aws-lambda";
import * as sqs from "@aws-cdk/aws-sqs";
import * as les from "@aws-cdk/aws-lambda-event-sources"
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

        const extraSecurityGroups = this.node.tryGetContext("extraIngressSecurityGroups")


        // Add Graph Queue
        const timeoutForGraphDeployment = cdk.Duration.minutes(5)
        const addGraphQueue = new sqs.Queue(this, "AddGraphQueue", { visibilityTimeout: timeoutForGraphDeployment });

        // Add Graph Worker
        const addGraphWorker = new lamdba.Function(this, "AddGraphWorker", {
            runtime: Runtime.PYTHON_3_7,
            code: new AssetCode(path.join(__dirname, "lambdas", "workers")),
            handler: "add_graph.handler",
            layers: [ kubectlLambdaLayer ],
            timeout: timeoutForGraphDeployment,
            environment: {
                cluster_name: props.cluster.clusterName,
                extra_security_groups: extraSecurityGroups == "" ? null : extraSecurityGroups
            }
        });

        addGraphWorker.addEventSource(new les.SqsEventSource(addGraphQueue));

        // Add permisssions to role
        addGraphWorker.addToRolePolicy(new iam.PolicyStatement({
            actions: [ "eks:DescribeCluster" ],
            resources: [ props.cluster.clusterArn ]
        }));

        props.cluster.awsAuth.addMastersRole(addGraphWorker.role!); // todo test that a role is actually created
        
        // Add Graph request handler
        const addGraphLambda = new lamdba.Function(this, "AddGraphHandler", {
            runtime: Runtime.PYTHON_3_7,
            code: new AssetCode(path.join(__dirname, "lambdas", "endpoints")),
            handler: "add_graph_request.handler",
            timeout: cdk.Duration.seconds(30),
            environment: {
                sqs_queue_url: addGraphQueue.queueUrl
            }
        });

        addGraphQueue.grantSendMessages(addGraphLambda)
        graphResource.addMethod("POST", new LambdaIntegration(addGraphLambda))
    }
}